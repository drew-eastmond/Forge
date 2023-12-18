type BuildTranform = { file: string, transforms: { plugin: string, output: string }[] };
type PluginSource = { $start?: Function, $header?: Function, $section?: Function, $footer?: Function, $complete: Function };

export interface IForgeBuildPlugin {

    $start(manifest: string[]): Promise<void>;

    $header(content: string): Promise<string>;

    $section(content: string, file: string): Promise<string>;

    $footer(content: string): Promise<string>;

    $complete(content: string): Promise<string>;

}
export class ForgeBuildPlugin implements IForgeBuildPlugin {

    private _source: PluginSource;

    constructor(source: string | unknown) {

        // firs sanitize the value
        if (source.constructor === String) {

            this._source = require(source as string);

        } else {

            this._source = source as PluginSource;

        }
        
    }

    public async $start(inputs: string[]): Promise<void> {

        if (this._source.$start instanceof Function) {

            await this._source.$start(inputs);

        }

    }


    public async $header(content: string): Promise<string> {

        if (this._source.$header instanceof Function) {

            return await this._source.$header(content);

        }

        return content;

    }

    public async $section(content: string, file: string): Promise<string> {

        if (this._source.$section instanceof Function) {

            return await this._source.$section(content, file);

        }

        return content;

    }

    public async $footer(content: string): Promise<string> {

        if (this._source.$footer instanceof Function) {

            return await this._source.$footer(content);

        }

        return content;

    }

    public async $complete(content: string): Promise<string> {

        if (this._source.$complete instanceof Function) {

            return await this._source.$complete(content);

        }

        return content;

    }

}