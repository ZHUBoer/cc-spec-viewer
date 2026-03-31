import fs from "node:fs";
import path from "node:path";
import Document, {
  Head,
  Html,
  Main,
  NextScript,
} from "@ctrip/nfes-next/document";

// 读取元素选择器工具代码
let elementSelectorScript = "";
try {
  const scriptPath = path.join(
    process.cwd(),
    "../../nfes/utils/elementSelector.js",
  );
  if (fs.existsSync(scriptPath)) {
    elementSelectorScript = fs.readFileSync(scriptPath, "utf-8");
  }
} catch (error) {
  console.error("[Document] 读取 elementSelector.js 失败:", error);
}

const REM_SCRIPT =
  '!function(n,e){var t=e.documentElement;function d(){var n=t.clientWidth;t.style.fontSize=n>=750?"40px":n<=375?"20px":n/375*20+"px"}n.addEventListener("resize",d),n.addEventListener("DOMContentLoaded",d)}(window,document)';
let CONTAINER_STYLE = "#__next{max-width: 750px;margin: 0 auto;}";
const RTL_LANG = ["ar"];
const getLangFromLocale = (locale) => {
  if (locale.indexOf("-") > 0) {
    return locale.split("-")[0];
  } else {
    return locale.split("_")[0];
  }
};
const isRTLFunc = (req) => {
  const urlQuery = req?.query;
  const locale = urlQuery.locale || "";
  const $local = locale || req?.sharkjs?.getLocale() || "en-US";
  const curLanguage = getLangFromLocale($local).toLowerCase();
  return RTL_LANG.includes(curLanguage);
};
export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    let isRTL = false;
    if (ctx.req?.supportRTL) {
      isRTL = isRTLFunc(ctx.req);
      if (isRTL) {
        CONTAINER_STYLE = `${CONTAINER_STYLE}body{transform: scaleX(-1);}`;
      } else {
        CONTAINER_STYLE = "#__next{max-width: 750px;margin: 0 auto;}";
      }
    }
    // 获取 webCoreBuildData，优先级：req > process > 文件
    let webCoreBuildData = ctx?.req?.webCoreBuildData;

    // 如果前两者都没有，尝试从文件读取（仅在服务端执行）
    if (!webCoreBuildData && typeof window === "undefined") {
      try {
        const candidates = [
          path.join(
            process.cwd(),
            "../../src/pages/xtarozxDemo/components/corehash-map.json",
          ),
          path.join(process.cwd(), "../../.next/webCoreBuildData.json"),
        ];

        for (const candidate of candidates) {
          if (!fs.existsSync(candidate)) {
            continue;
          }
          const fileContent = fs.readFileSync(candidate, "utf-8");
          webCoreBuildData = JSON.parse(fileContent);
          break;
        }

        if (!webCoreBuildData) {
          console.warn(
            "[Document Debug] 未找到 webCoreBuildData 映射文件:",
            candidates,
          );
        }
      } catch (error) {
        console.error(
          "[Document Debug] 读取 webCoreBuildData.json 文件失败:",
          error,
        );
      }
    }

    // 如果都没有，使用空对象
    webCoreBuildData = webCoreBuildData || {};

    return {
      ...initialProps,
      xtaroCmpBridgeUrl: ctx?.req?.xtaroCmpBridgeUrl,
      isRTL: isRTL,
      webCoreBuildData: webCoreBuildData,
    };
  }
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover"
          />
          <style
            type="text/css"
            dangerouslySetInnerHTML={{
              __html: CONTAINER_STYLE,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: REM_SCRIPT,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__ISRTL__="${this.props.isRTL ? "T" : "F"}"`,
            }}
          />
        </Head>
        <body>
          <Main />
          {this.props.xtaroCmpBridgeUrl && (
            <script src={this.props.xtaroCmpBridgeUrl}></script>
          )}
          {this.props.webCoreBuildData && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__WebCoreAssistant__ = ${JSON.stringify(
                  this.props.webCoreBuildData,
                )}`,
              }}
            />
          )}
          {elementSelectorScript && (
            <script
              dangerouslySetInnerHTML={{
                __html: elementSelectorScript,
              }}
            />
          )}
          <NextScript />
        </body>
      </Html>
    );
  }
}
