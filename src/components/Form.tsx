import Button from "./Button";
import Input from "./Input";
import { useForm, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  age: z.number().min(18, { message: "Age must be at least 18" }),
});

type FormData = z.infer<typeof schema>;

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };

  /* useRef */
  //   const nameRef = useRef<HTMLInputElement>(null);
  //   const ageRef = useRef<HTMLInputElement>(null);
  //   const person = { name: "", age: 0 }; // object to send to the server

  //   const handleSubmit = (event: FormEvent) => {
  //     event.preventDefault();
  //     const formData = new FormData(event.target as HTMLFormElement);
  //     const data = Object.fromEntries(formData);
  //     console.log(data);
  //     if (nameRef.current !== null && ageRef.current !== null) {
  //       person.name = nameRef.current.value;
  //       person.age = Number(ageRef.current.value);
  //       console.log(person);
  //     }
  //   };

  /* useState */
  //it sets the state of the person object whenever the input changes
  //   const [person, setPerson] = useState({ name: "", age: "" });

  //   const handleSubmit = (event: FormEvent) => {
  //     event.preventDefault();
  //     console.log(person);
  //   };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Input type="text" {...register("name")} label="Name" id="name" />
        {errors.name && <p>{errors.name.message}</p>}
        <Input type="number" {...register("age")} label="Age" id="age" />
        {errors.age && <p>{errors.age.message}</p>}
        <Button
          type="submit"
          variant="secondary"
          alignX="right"
          alignY="bottom"
        >
          Sent
        </Button>
      </div>
    </form>
  );
};

export default Form;
