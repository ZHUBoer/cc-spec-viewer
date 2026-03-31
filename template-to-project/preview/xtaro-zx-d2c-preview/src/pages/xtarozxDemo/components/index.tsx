import {
  XImage,
  XImageBackground,
  XLinearGradient,
  XText,
  XView,
} from "@ctrip/xtaro-zx";

import styles from "./index.module.scss";

const App = (_props) => {
  return (
    <XView className={styles.view}>
      <XView className={styles.view01}>
        <XView className={styles.view02}>
          <XView className={styles.view03}>
            <XText className={styles.text}>
              <XText className={styles.span_shared_1}>9:4</XText>
              <XText className={styles.span_shared_1}>1</XText>
            </XText>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2333p12000ro58u5tCA0C.png"
              className={styles.img}
            ></XImage>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2335z12000ro58wkf5B64.png"
              className={styles.img01}
            ></XImage>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2334012000ro58hb94974.png"
              className={styles.img02}
            ></XImage>
          </XView>
          <XView className={styles.view04}>
            <XView className={styles.view05}>
              <XView className={styles.view06}></XView>
              <XImage
                src="https://dimg04.c-ctrip.com/images/2334b12000ro58mtr4BF5.png"
                className={styles.img03}
              ></XImage>
            </XView>
            <XView className={styles.view07}>
              <XView className={styles.view08}>
                <XView className={styles.view09}>
                  <XImage
                    src="https://dimg04.c-ctrip.com/images/2331j12000rr602r6E97D.png"
                    className={styles.img04}
                  ></XImage>
                  <XImage
                    src="https://dimg04.c-ctrip.com/images/2330m12000rr60fhdDA6B.png"
                    className={styles.img05}
                  ></XImage>
                </XView>
                <XView className={styles.view10}>
                  <XImage
                    src="https://dimg04.c-ctrip.com/images/2331i12000rr60fhe8534.png"
                    className={styles.img06}
                  ></XImage>
                  <XImage
                    src="https://dimg04.c-ctrip.com/images/2335r12000rr5zz3gF0AD.png"
                    className={styles.img07}
                  ></XImage>
                </XView>
              </XView>
            </XView>
          </XView>
        </XView>
      </XView>
      <XView className={styles.view11}></XView>
      <XImage
        src="https://dimg04.c-ctrip.com/images/2336v12000rr602rcBBE7.png"
        className={styles.img08}
      ></XImage>
      <XImage
        src="https://dimg04.c-ctrip.com/images/2336612000rr606q0102A.png"
        className={styles.img09}
      ></XImage>
      <XView className={styles.view12}>
        <XView className={styles.view13}></XView>
        <XImage
          src="https://dimg04.c-ctrip.com/images/2333s12000ro58p1y49F4.png"
          className={styles.img10}
        ></XImage>
        <XView className={styles.view14}>
          <XImageBackground
            src="https://dimg04.c-ctrip.com/images/2335812000ro58wqr93E6.png"
            className={styles.view15}
          >
            <XImage
              src="https://dimg04.c-ctrip.com/images/2335r12000ro58hb3567A.png"
              className={styles.img11}
            ></XImage>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2334k12000ro58u5m47A5.png"
              className={styles.img12}
            ></XImage>
            <XView className={styles.view16}>
              <XImage
                src="https://dimg04.c-ctrip.com/images/2336612000rpm1wcq8B0D.png"
                className={styles.img13}
              ></XImage>
              <XText className={styles.text1}>抖音支付券包</XText>
              <XImage
                src="https://dimg04.c-ctrip.com/images/2333012000ro58iqf9401.png"
                className={styles.img14}
              ></XImage>
              <XView className={styles.view17}>
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2331c12000ro58hb615ED.png"
                  className={styles.img15}
                ></XImage>
                <XText className={styles.text2}>仅抖音支付可用</XText>
              </XView>
              <XView className={styles.view18}>
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2334o12000ro58p1z1B19.png"
                  className={styles.img16}
                ></XImage>
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2333v12000ro58gaf5E06.png"
                  className={styles.img17}
                ></XImage>
              </XView>
              <XView className={styles.view19}>
                <XText className={styles.text3}>我的购买记录</XText>
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2334w12000ro58hbaA8F9.png"
                  className={styles.img18}
                ></XImage>
              </XView>
            </XView>
          </XImageBackground>
          <XView className={styles.view20}>
            <XText className={styles.text4}>我的购买记录</XText>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2335k12000ro58k5k5AA9.png"
              className={styles.img19}
            ></XImage>
          </XView>
        </XView>
      </XView>
      <XView className={styles.view21}>
        <XView className={styles.view22}></XView>
        <XLinearGradient
          colors={["#ffffff", "#fff7d9"]}
          locations={[0.6442307829856873, 1]}
          start={{
            x: 0.5,
            y: 1,
          }}
          end={{
            x: 0.5,
            y: 0,
          }}
          className={styles.view23}
        ></XLinearGradient>
        <XText className={styles.text5}>Banner</XText>
        <XView className={styles.view24}>
          <XImage
            src="https://dimg04.c-ctrip.com/images/2332e12000ro58e8h58AE.png"
            className={styles.img20}
          ></XImage>
          <XImage
            src="https://dimg04.c-ctrip.com/images/2332012000ro58k5g1049.png"
            className={styles.img21}
          ></XImage>
        </XView>
        <XText className={styles.text6}>
          <XText className={styles.span_shared_2}>一、活动时间：</XText>
          <XText className={styles.span_shared_3}> </XText>
          <XText className={styles.span_shared_4}>
            1.活动时间：2025年10月15日-2025年12月31日，每周六0点可开始领取补贴，直至下周五23:59。 2.补贴使用时间：活动周周五
            例如：2025年10月18日0点-2025年10月24日23点59可以开始领取权益，领取的补贴可使用时间为2025年10月24日当天
          </XText>

          <XText className={styles.span_shared_4}></XText>
          <XText className={styles.span_shared_3}> </XText>
          <XText className={styles.span_shared_2}>二、活动参与条件：</XText>
          <XText className={styles.span_shared_3}> </XText>
          <XText className={styles.span_shared_4}>
            本活动可参与用户范围如下： 1.
            用户须为智行火车票、智行旅行app或小程序的注册用户 2.用户可通过智行火车票、智行旅行app站内活动入口，小程序活动入口或者好友分享链接参与本活动 3.不得为异常用户，异常用户判定标准详见注意事项。
          </XText>

          <XText className={styles.span_shared_4}></XText>
          <XText className={styles.span_shared_3}> </XText>
          <XText className={styles.span_shared_2}>三、活动参与方法：</XText>
          <XText className={styles.span_shared_3}> </XText>
          <XText className={styles.span_shared_4}>
            1.
            用户可以选择领取智行官方优惠券，优惠券为酒店满减券，金额随机发放，具体以页面显示为准，。 2.用户选择领取优惠券后，将获得赠送给好友领取优惠券的机会，如果累计5位好友接收邀请并成功领取优惠券，则分享者的优惠券金额会进行进一步的随机膨胀，膨胀后的金额具体以页面显示为准。 3.优惠券使用后，无法继续进行膨胀操作。 4.如果用户使用补贴进行下单，停留在待支付环节，则补贴会进行锁定，无法进行二次使用，需要先将该待支付订单取消才可正常使用。 5.优惠券有限，活动当日先到先用，如果到达库存，则后续用户无法继续使用优惠券支付。
          </XText>

          <XText className={styles.span_shared_4}></XText>
          <XText className={styles.span_shared_3}> </XText>
        </XText>
      </XView>
    </XView>
  );
};

export default App;
