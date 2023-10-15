import { $ParseRequestBody, ForgeServer } from "../server/ForgeServer";
import { DelegateRoute } from "../server/Route";
import { ForgeModel } from "./ForgeModel";

export class SimpleForgeStorage extends ForgeModel {

    private async _routeSave(request, response, next: Function): Promise<void> {

        const taskName: string = request.params.task;
        const actionName: string = request.params.action;
        const key: string = request.params[0];
        
        try {

            // const requestBody: string = String(await this._requestBodyParser.$parse(request));
            const { mime, buffer } = await $ParseRequestBody(request);
            // await this.$save(`${taskName}/${actionName}`, key, mime, buffer);

            response
                .sendStatus(200)
                .end();

        } catch (error: unknown) {

            if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

            response.sendStatus(404).end();

        }

    }

    public connect(forgeServer: ForgeServer): this {

        forgeServer.add(new DelegateRoute("/:task/:action/storage/save/*", this._routeSave.bind(this)));

        forgeServer.add(new DelegateRoute("/:task/:action/storage/load/*", async function (request, response, next: Function) {

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            const key: string = request.params[0];

            try {

                // localize the access to the task/action
                const { mime, buffer } = await this.$load(`${taskName}/${actionName}`, key);
                response.setHeader("Content-Type", mime).end(buffer);

            } catch (error: unknown) {

                if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

                response.sendStatus(404).end();

            }

        }.bind(this)));

        forgeServer.add(new DelegateRoute("/:task/:action/storage/keys", async function (request, response, next: Function) {

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;

            try {

                const partitionName: string = `${taskName}/${actionName}`;
                const keys: string[] = await this.$keys(partitionName);

                const output: string = JSON.stringify(keys);
                response
                    .setHeader("Content-Type", "application/json")
                    .end(Buffer.from(output));

            } catch (error: unknown) {

                if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

                response.sendStatus(404).end();

            }

        }.bind(this)));

        return this;


    }

}