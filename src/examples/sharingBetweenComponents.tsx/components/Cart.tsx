import { useState } from "react";
import Button from "../../../components/Button";

interface Props {
  cartItems: string[];
  onClear: () => void;
}

const Cart = ({ cartItems, onClear }: Props) => {
  const [cart, setCart] = useState({
    discount: 0.1,
    items: [
      {
        id: 1,
        title: "Product 1",
        quantity: 1,
      },
      {
        id: 2,
        title: "Product 2",
        quantity: 1,
      },
    ],
  });

  const updateCart = () => {
    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.id === 2 ? { ...item, quantity: item.quantity + 1 } : item
      ),
    });
  };

  return (
    <>
      <div>Cart</div>
      <ul>
        {cartItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button
          onClick={onClear}
          variant="primary"
          size="md"
          alignX="right"
          alignY="bottom"
        >
          Clear
        </Button>

        <Button
          onClick={updateCart}
          variant="primary"
          size="md"
          alignX="right"
          alignY="bottom"
        >
          Update Cart
        </Button>
        <div>
          <p>Discount: {cart.discount}</p>
          <p>Items: {cart.items.length}</p>
          <p>Items: {cart.items.map((item) => item.title).join(", ")}</p>
          <p>
            Total: {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
        </div>
      </div>
    </>
  );
};

export default Cart;
