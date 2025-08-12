import ShaeringStatesBetweenComponents from "./examples/sharingBetweenComponents.tsx/SharingStatesBetweenComponents";
import FormPage from "./pages/FormPage";
import UpdatingState from "./examples/UpdatingState";
import ExpandableText from "./examples/ExpandableText";
import Form from "./components/Form";
import ExpenseTracker from "./examples/ExpenseTracker/ExpenseTracker";

function App() {
  return (
    <>
      <FormPage />
      <ShaeringStatesBetweenComponents />
      <UpdatingState />
      <ExpandableText maxChars={100}>
        Glinthors Lantern flickered in the mist, its glow bending in ways that
        defied straight lines. Somewhere beyond the crooked bridge, a sound like
        paper tearing drifted through the air. Maren tightened their scarf, took
        a deep breath of the peppery wind, and stepped forward, knowing the next
        stone might not be there at all.
      </ExpandableText>
      <Form />

      <div className="space-y-4">
        <hr className="border-t-2 border-gray-300 my-8" />
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          EXPENSE TRACKER
        </h1>
      </div>
      <ExpenseTracker />
    </>
  );
}

export default App;
