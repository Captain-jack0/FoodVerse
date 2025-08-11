import { useState } from "react";
import NavBar from "./components/NavBar";
import Cart from "./components/Cart";

function ShaeringStatesBetweenComponents() {
  const [cartItems, setCartItems] = useState([
    "ProductObecjt1",
    "PprodcutObject2",
  ]);

  return (
    <div>
      <NavBar cartItemsCount={cartItems.length} />
      <Cart cartItems={cartItems} />
    </div>
  );
}

export default ShaeringStatesBetweenComponents;
