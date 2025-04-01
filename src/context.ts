import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";
import * as version from "./version";

export type BufFile = {
  path: string;
  module: string;
};

export enum ServerStatus {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SERVER_DISABLED,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SERVER_STARTING,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SERVER_RUNNING,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SERVER_STOPPED,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SERVER_ERRORED,
}

export class BufContext implements vscode.Disposable {
  public module: string = "";
  public client?: lsp.LanguageClient;
  public serverOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("Buf (server)");
  public bufFiles: Map<string, BufFile> = new Map<string, BufFile>();

  private _busy: boolean = false;
  private _buf?: version.BufVersion;
  private _status: ServerStatus = ServerStatus.SERVER_STOPPED;

  private onDidChangeContextEmitter = new vscode.EventEmitter<void>();

  public set status(value: ServerStatus) {
    if (this._status !== value) {
      this._status = value;
      this.onDidChangeContextEmitter.fire();
    }
  }

  public get status(): ServerStatus {
    return this._status;
  }

  public set busy(value: boolean) {
    this._busy = value;
    this.onDidChangeContextEmitter.fire();
  }

  public get busy(): boolean {
    return this._busy;
  }

  public set buf(value: version.BufVersion | undefined) {
    if (this._buf !== value) {
      this._buf = value;
      this.onDidChangeContextEmitter.fire();
    }
  }

  public get buf(): version.BufVersion | undefined {
    return this._buf;
  }

  public get onDidChangeContext(): vscode.Event<void> {
    return this.onDidChangeContextEmitter.event;
  }

  dispose() {
    this.serverOutputChannel.dispose();
  }
}
