import { XIPhonexAdapter } from "@ctrip/xtaro";
import { XView } from "@ctrip/xtaro-zx";
import Components from "./components";

import styles from "./index.module.scss";

const App = () => {
  return (
    <XView className={styles.container}>
      <XIPhonexAdapter.Top />
      <Components />
    </XView>
  );
};

export default App;
