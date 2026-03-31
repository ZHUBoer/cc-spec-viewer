"use client";
import { XImage, XImageBackground, XText, XView } from "@ctrip/xtaro-zx-h5";
import React from "react";
import styles from "./index.module.scss";

const ActivityPage = () => {
  return (
    <XView className={styles.pageContainer} data-corehash="0e03ce61">
      <XView className={styles.headerSection} data-corehash="0b25fc06">
        <XView className={styles.statusBar} data-corehash="cf84a93f">
          <XView className={styles.statusBarContent} data-corehash="a14e5802">
            <XText className={styles.timeText} data-corehash="6eb98ac4">
              9:41
            </XText>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2333p12000ro58u5tCA0C.png"
              className={styles.signalIcon}
              data-corehash="5d62bb27"
            />
            <XImage
              src="https://dimg04.c-ctrip.com/images/2335z12000ro58wkf5B64.png"
              className={styles.wifiIcon}
              data-corehash="fdf48cfe"
            />
            <XImage
              src="https://dimg04.c-ctrip.com/images/2334012000ro58hb94974.png"
              className={styles.batteryIcon}
              data-corehash="eb616711"
            />
          </XView>
          <XView className={styles.navBar} data-corehash="50e1778e">
            <XView className={styles.backButton} data-corehash="97d6c274">
              <XView className={styles.backButtonBg} data-corehash="144fb48f" />
              <XImage
                src="https://dimg04.c-ctrip.com/images/2334b12000ro58mtr4BF5.png"
                className={styles.backIcon}
                data-corehash="ba2f2723"
              />
            </XView>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2331c12000rrfhbbm758A.png"
              className={styles.logoImage}
              data-corehash="5e6a667c"
            />
          </XView>
        </XView>
      </XView>

      <XView className={styles.backgroundLayer} data-corehash="a4517193" />
      <XImage
        src="https://dimg04.c-ctrip.com/images/2336v12000rr602rcBBE7.png"
        className={styles.bgDecoration}
        data-corehash="b956ef02"
      />
      <XImage
        src="https://dimg04.c-ctrip.com/images/2336612000rr606q0102A.png"
        className={styles.titleImage}
        data-corehash="79b086eb"
      />

      <XView className={styles.mainContent} data-corehash="b1a41201">
        <XView className={styles.decorationWrapper} data-corehash="3690c949" />
        <XView className={styles.decorationGroup} data-corehash="97fb6d65">
          <XImage
            src="https://dimg04.c-ctrip.com/images/2335r12000ro58hb3567A.png"
            className={styles.decorTopIcon}
            data-corehash="ef4e8d39"
          />
          <XImage
            src="https://dimg04.c-ctrip.com/images/2333s12000ro58p1y49F4.png"
            className={styles.decorCircle}
            data-corehash="0997799a"
          />
          <XImage
            src="https://dimg04.c-ctrip.com/images/2334k12000ro58u5m47A5.png"
            className={styles.decorBottomIcon}
            data-corehash="da302dc6"
          />
        </XView>

        <XView className={styles.cardSection} data-corehash="27f4ba06">
          <XImageBackground
            src="https://dimg04.c-ctrip.com/images/2335812000ro58wqr93E6.png"
            className={styles.voucherCard}
            data-corehash="431697f4"
          >
            <XView className={styles.cardContent} data-corehash="2606832e">
              <XImage
                src="https://dimg04.c-ctrip.com/images/2336612000rpm1wcq8B0D.png"
                className={styles.cardBgDecor}
                data-corehash="970147f9"
              />
              <XImage
                src="https://dimg04.c-ctrip.com/images/2333012000ro58iqf9401.png"
                className={styles.cardDivider}
                data-corehash="d24a87d4"
              />
              <XView className={styles.badgeWrapper} data-corehash="943242fe">
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2331c12000ro58hb615ED.png"
                  className={styles.badgeImage}
                  data-corehash="65b2e193"
                />
                <XText className={styles.badgeText} data-corehash="c098d41c">
                  仅抖音支付可用
                </XText>
              </XView>
              <XText className={styles.voucherTitle} data-corehash="504df5a3">
                抖音支付券包
              </XText>
              <XView className={styles.actionButton} data-corehash="2fa5f32c">
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2334o12000ro58p1z1B19.png"
                  className={styles.buttonBg}
                  data-corehash="58c15765"
                />
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2333v12000ro58gaf5E06.png"
                  className={styles.buttonText}
                  data-corehash="b88308b2"
                />
              </XView>
              <XView className={styles.historyLink} data-corehash="92e42b02">
                <XText className={styles.historyText} data-corehash="0e023a3b">
                  我的购买记录
                </XText>
                <XImage
                  src="https://dimg04.c-ctrip.com/images/2334w12000ro58hbaA8F9.png"
                  className={styles.arrowIcon}
                  data-corehash="ad74f883"
                />
              </XView>
            </XView>
          </XImageBackground>
          <XView className={styles.historyEntry} data-corehash="9c1de41a">
            <XText className={styles.historyEntryText} data-corehash="b8ba7448">
              我的购买记录
            </XText>
            <XImage
              src="https://dimg04.c-ctrip.com/images/2335k12000ro58k5k5AA9.png"
              className={styles.historyArrowIcon}
              data-corehash="e0d222b3"
            />
          </XView>
        </XView>
      </XView>

      <XView className={styles.rulesSection} data-corehash="5a9e11aa">
        <XView className={styles.rulesBg} data-corehash="30babd7e" />
        <XView className={styles.rulesGradient} data-corehash="d60f056c" />
        <XText className={styles.bannerPlaceholder} data-corehash="dbd8b03a">
          Banner
        </XText>
        <XView className={styles.rulesTitle} data-corehash="7b93e379">
          <XImage
            src="https://dimg04.c-ctrip.com/images/2332e12000ro58e8h58AE.png"
            className={styles.rulesTitleBg}
            data-corehash="e7418661"
          />
          <XImage
            src="https://dimg04.c-ctrip.com/images/2332012000ro58k5g1049.png"
            className={styles.rulesTitleText}
            data-corehash="8ce1905a"
          />
        </XView>
        <XView className={styles.rulesContent} data-corehash="6af43865">
          <XView className={styles.rulesParagraph} data-corehash="856d90d4">
            <XView className={styles.rulesLine} data-corehash="8ceeb8be">
              <XText className={styles.rulesHeading} data-corehash="4c830820">
                一、活动时间：
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="67d50b72">
              <XText className={styles.rulesText} data-corehash="43e4b547">
                1.活动时间：2025年10月15日-2025年12月31日，每周六0点可开始领取补贴，直至下周五23:59。
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="4c3ba680">
              <XText className={styles.rulesText} data-corehash="635b42be">
                2.补贴使用时间：活动周周五
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="b0aeb0f6">
              <XText className={styles.rulesText} data-corehash="c5f15136">
                {" "}
                例如：2025年10月18日0点-2025年10月24日23点59可以开始领取权益，领取的补贴可使用时间为2025年10月24日当天
              </XText>
            </XView>
          </XView>
          <XView className={styles.rulesParagraph} data-corehash="e1799ae5">
            <XView className={styles.rulesLine} data-corehash="937669f1">
              <XText className={styles.rulesHeading} data-corehash="82eb2907">
                二、活动参与条件：
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="a4e392d4">
              <XText className={styles.rulesText} data-corehash="0f9dacd9">
                本活动可参与用户范围如下：
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="01461cfc">
              <XText className={styles.rulesText} data-corehash="ece4c13f">
                1. 用户须为智行火车票、智行旅行app或小程序的注册用户
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="fa7bc1a5">
              <XText className={styles.rulesText} data-corehash="eeff19e4">
                2.用户可通过智行火车票、智行旅行app站内活动入口，小程序活动入口或者好友分享链接参与本活动
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="f4635794">
              <XText className={styles.rulesText} data-corehash="5e840876">
                3.不得为异常用户，异常用户判定标准详见注意事项。
              </XText>
            </XView>
          </XView>
          <XView className={styles.rulesParagraphLast} data-corehash="4ca1213e">
            <XView className={styles.rulesLine} data-corehash="87376338">
              <XText className={styles.rulesHeading} data-corehash="a4cbaca7">
                三、活动参与方法：
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="baf7d9bd">
              <XText className={styles.rulesText} data-corehash="eba345cf">
                1.
                用户可以选择领取智行官方优惠券，优惠券为酒店满减券，金额随机发放，具体以页面显示为准，。
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="4239cdeb">
              <XText className={styles.rulesText} data-corehash="05f495fe">
                2.用户选择领取优惠券后，将获得赠送给好友领取优惠券的机会，如果累计5位好友接收邀请并成功领取优惠券，则分享者的优惠券金额会进行进一步的随机膨胀，膨胀后的金额具体以页面显示为准。
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="72a2b0eb">
              <XText className={styles.rulesText} data-corehash="c86d386e">
                3.优惠券使用后，无法继续进行膨胀操作。
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="347396c9">
              <XText className={styles.rulesText} data-corehash="80168a59">
                4.如果用户使用补贴进行下单，停留在待支付环节，则补贴会进行锁定，无法进行二次使用，需要先将该待支付订单取消才可正常使用。
              </XText>
            </XView>
            <XView className={styles.rulesLine} data-corehash="aa0c9111">
              <XText className={styles.rulesText} data-corehash="3b210e32">
                5.优惠券有限，活动当日先到先用，如果到达库存，则后续用户无法继续使用优惠券支付。
              </XText>
            </XView>
          </XView>
        </XView>
      </XView>
    </XView>
  );
};
export default ActivityPage;
