import { XView } from "@ctrip/xtaro-zx";

import "./tokens.scss";

import Components from "./components";

import styles from "./index.module.scss";

const App = () => {
  return (
    <XView className={styles.wrapper}>
      <XView className={styles.container}>
        <Components />
      </XView>
    </XView>
  );
};

export default App;
