import { $Promise, $UseRace, QuickHash, Serialize } from "../../core/Core";
import { ISubscription, Subscription } from "../../core/Subscription";

const __ForgeProtocol: string = "forge://";

export interface IServiceAdapter extends ISubscription {

    race: number;

    read(message): void;
    write(...data: Serialize[]): void;

    $reset(data: Serialize): Promise<Serialize>;

    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;

}

export class AbstractServiceAdapter extends Subscription implements IServiceAdapter {

    protected _key: string = QuickHash();

    protected readonly _sessions: Map<string, $Promise<unknown>> = new Map();
    protected readonly _bindings: Map<Function, Function> = new Map();

    public race: number;

    constructor(config: { race: number }) {

        super();

        this.race = config.race;

    }

    public read(message: any): boolean {

        try {

            // first test is to destructure the message
            const [protocol, header, data] = message;

            // console.log(protocol, header, data);

            if (protocol != __ForgeProtocol) return;
            if (header.key != this._key) return;

            if ("resolve" in header) {

                const $race: $Promise = this._sessions.get(header.resolve);
                $race[1](data);
                this.notify("resolve", header, data);


            } else if ("reject" in header) {

                console.log("rejected", protocol, header, data);
                
                const $race: $Promise = this._sessions.get(header.reject);
                $race[2](data);
                this.notify("reject", header, data);

            } else if ("broadcast" in header) {

                const { notify } = header;
                this.notify("broadcast", notify, data);

            } else {

                this.notify("message", message);

            }

            return true;

        } catch (error: unknown) {

            // just catch teh error
            // console.log("read error", error)

        }

        return false;

    }

    public write(...data: Serialize[]): void {

        throw new Error("Please override write(...) in subclasses");

    }

    public $reset(data: Serialize): Promise<Serialize> {

        return this.$signal("reset", data, this.race);

    }

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // console.log(signal, data, race);

        const session: string = QuickHash();

        const sessions: Map<string, $Promise> = this._sessions;

        const $race: $Promise<unknown> = $UseRace(race);
        $race[0]
            .catch(function (error: unknown) {

                //console.parse("<yellow>$signal exception caught :</yellow>", error);

            })
            .finally(function () {

                sessions.delete(session);

            });


        this._sessions.set(session, $race);

        this.write({ signal, session, key: this._key }, data);

        return $race[0];

    }

}