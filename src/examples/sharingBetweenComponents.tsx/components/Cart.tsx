import Button from "../../../components/Button";

interface Props {
  cartItems: string[];
  onClear: () => void;
}

const Cart = ({ cartItems, onClear }: Props) => {
  return (
    <>
      <div>Cart</div>
      <ul>
        {cartItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Button onClick={onClear} className="my-button-style primary">
        Clear
      </Button>
    </>
  );
};

export default Cart;
