import { BasePage } from "@ctrip/function-nfes-helper";
import PreviewComponent from "./components/index";

export default async function Home() {
  return (
    <BasePage pageId="10650034086" enableInjectRemScript={true}>
      <PreviewComponent />
    </BasePage>
  );
}
