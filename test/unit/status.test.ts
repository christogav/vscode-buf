import sinon from "sinon";
import * as assert from "assert";
import * as vscode from "vscode";
import * as status from "../../src/status";

import {
  ExtensionContextPlus,
  MockExtensionContext,
} from "../mocks/mock-context";
import { BufContext } from "../../src/context";

suite("status", function () {
  vscode.window.showInformationMessage("Start all status tests.");

  let sandbox: sinon.SinonSandbox;

  let ctx: ExtensionContextPlus;

  let statusBarItem: vscode.StatusBarItem;
  let createStatusBarItemStub: sinon.SinonStub;

  let bufCtx: BufContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bufCtxonDidChangeContextSpy: any;

  let createOutputChannelStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    statusBarItem = vscode.window.createStatusBarItem();
    createStatusBarItemStub = sandbox
      .stub(vscode.window, "createStatusBarItem")
      .returns(statusBarItem);

    ctx = MockExtensionContext.new();

    createOutputChannelStub = sandbox
      .stub(vscode.window, "createOutputChannel")
      .returns({
        name: "Buf (server)",
        dispose: () => {},
        logLevel: vscode.LogLevel.Info,
        onDidChangeLogLevel: { event: () => () => {} },
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      } as unknown as vscode.LogOutputChannel);

    bufCtx = new BufContext();
    bufCtxonDidChangeContextSpy = sandbox.spy(bufCtx, "onDidChangeContext", [
      "get",
    ]);

    status.activate(ctx, bufCtx);
  });

  teardown(() => {
    bufCtx.dispose();
    ctx.teardown();
    sandbox.restore();
    status.disposeStatusBar();
  });

  test("activate creates an output channel", function () {
    assert.strictEqual(createOutputChannelStub.callCount, 1);
  });

  test("activate sets up subscriptions", function () {
    assert.strictEqual(ctx.subscriptions.length, 2);
    assert.strictEqual(bufCtxonDidChangeContextSpy.get.calledOnce, true);
  });

  test('activate creates a status bar item with the name "Buf"', () => {
    assert.strictEqual(createStatusBarItemStub.callCount, 1);
    assert.strictEqual(statusBarItem.name, "Buf");
  });
});
