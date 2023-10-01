import styles from "../styles/Cart.module.css";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import GooglePayButton from "@google-pay/button-react";
import axios from "axios";
import { useRouter } from "next/router";
import { reset } from "../redux/cartSlice";
// import { iteratorSymbol } from "immer/dist/internal";
import OrderDetail from "../components/OrderDetail";

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const [open, setOpen] = useState(false);
  const [cash, setCash] = useState(false);
  const amount = cart.total;
  const currency = "USD";
  const style = { layout: "vertical" };
  const dispatch = useDispatch();
  const router = useRouter();

  const createOrder = async (data) => {
    try {
      const res = await axios.post(
        "https://chizza.netlify.app/api/orders",
        data
      );
      if (res.status === 201) {
        dispatch(reset());
        router.push(`/orders/${res.data._id}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Custom component to wrap the PayPalButtons and handle currency changes
  const ButtonWrapper = ({ currency, showSpinner }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
      dispatch({
        type: "resetOptions",
        value: {
          ...options,
          currency: currency,
        },
      });
    }, [currency, showSpinner]);

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <GooglePayButton
          //  vironment="TEST"
          //     buttonSizeMode="fill"
          //     paymentRequest={{
          //       apiVersion: 2,
          //       apiVersionMinor: 0,
          //       allowedPaymentMethods: [
          //         {
          //           type: 'CARD',
          //           parameters: {
          //             allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          //             allowedCardNetworks: ['MASTERCARD', 'VISA']
          //           },
          //           tokenizationSpecification: {
          //             type: 'PAYMENT_GATEWAY',
          //             parameters: {
          //               gateway: 'example',
          //               gatewayMerchantId: 'exampleGatewayMerchantId',
          //             },
          //           },
          //         },
          //       ],
          //       merchantInfo: {
          //         merchantId: '17612812255336763067',
          //         merchantName: 'Demo only',
          //       },
          //       transactionInfo: {
          //         totalPriceStatus: 'FINAL',
          //         totalPriceLabel: 'Total',
          //         totalPrice: item.price.toFixed(2),
          //         currencyCode: 'USD',
          //         countryCode: 'US',
          //       },
          //     }}
          //     onLoadPaymentData={paymentData => {
          //       console.log('TODO: send order to server', paymentData.paymentMethodData);
          //       history.push('/confirm');
          //     }}   en

          style={style}
          disabled={false}
          forceReRender={[amount, currency, style]}
          fundingSource={undefined}
          createOrder={(data, actions) => {
            return actions.order
              .create({
                purchase_units: [
                  {
                    amount: {
                      currency_code: currency,
                      value: amount,
                    },
                  },
                ],
              })
              .then((orderId) => {
                // Your code here after create the order
                return orderId;
              });
          }}
          onApprove={function (data, actions) {
            return actions.order.capture().then(function (details) {
              const shipping = details.purchase_units[0].shipping;
              createOrder({
                customer: shipping.name.full_name,
                address: shipping.address.address_line_1,
                total: cart.total,
                method: 1,
              });
            });
          }}
        />
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.trTitle}>
              <th>Product</th>
              <th>Name</th>
              <th>Extras</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </tbody>
          <tbody>
            {cart.products.map((product) => (
              <tr className={styles.tr} key={product._id}>
                <td>
                  <div className={styles.imgContainer}>
                    <Image
                      src={product.img}
                      layout="fill"
                      objectFit="cover"
                      alt=""
                    />
                  </div>
                </td>
                <td>
                  <span className={styles.name}>{product.title}</span>
                </td>
                <td>
                  <span className={styles.extras}>
                    {product.extras.map((extra) => (
                      <span key={extra._id}>{extra.text}, </span>
                    ))}
                  </span>
                </td>
                <td>
                  <span className={styles.price}>${product.price}</span>
                </td>
                <td>
                  <span className={styles.quantity}>{product.quantity}</span>
                </td>
                <td>
                  <span className={styles.total}>
                    ${product.price * product.quantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.right}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>CART TOTAL</h2>
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Subtotal:</b>${cart.total}
          </div>
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Discount:</b>$0.00
          </div>
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Total:</b>${cart.total}
          </div>
          {open ? (
            <div className={styles.paymentMethods}>
              <button
                className={styles.payButton}
                onClick={() => setCash(true)}
              >
                CASH ON DELIVERY
              </button>
              <GooglePayButton
                environment="TEST"
                buttonSizeMode="fill"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: "CARD",
                      parameters: {
                        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        allowedCardNetworks: ["MASTERCARD", "VISA"],
                      },
                      tokenizationSpecification: {
                        type: "PAYMENT_GATEWAY",
                        parameters: {
                          gateway: "example",
                          gatewayMerchantId: "exampleGatewayMerchantId",
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    merchantId: "12345678901234567890",
                    merchantName: "Demo Merchant",
                  },
                  transactionInfo: {
                    totalPriceStatus: "FINAL",
                    totalPriceLabel: "Total",
                    totalPrice: "1",
                    currencyCode: "USD",
                    countryCode: "US",
                  },
                  shippingAddressRequired: true,
                  callbackIntents: [
                    "SHIPPING_ADDRESS",
                    "PAYMENT_AUTHORIZATION",
                  ],
                }}
                onLoadPaymentData={(paymentRequest) => {
                  console.log("Success", paymentRequest);
                }}
                onPaymentAuthorized={(paymentData) => {
                  console.log("Payment Authorised Success", paymentData);
                  return { transactionState: "SUCCESS" };
                }}
                onPaymentDataChanged={(paymentData) => {
                  console.log("On Payment Data Changed", paymentData);
                  return {};
                }}
                existingPaymentMethodRequired="false"
                buttonColor="white"
                buttonType="Buy"
              />
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className={styles.button}>
              CHECKOUT NOW!
            </button>
          )}
        </div>
      </div>
      {cash && <OrderDetail total={cart.total} createOrder={createOrder} />}
    </div>
  );
};

export default Cart;
