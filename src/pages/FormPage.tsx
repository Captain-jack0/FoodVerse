import { Formik, Form, Field, type FieldProps } from "formik";
import * as Yup from "yup";
import "../styles/FormPage.css";

import Input from "../components/Input";
import Button from "../components/Button";
import { useState } from "react";
import Card from "../components/Card";

const validationSchema = Yup.object({
  ad: Yup.string().required("Ad zorunlu"),
  soyad: Yup.string().required("Soyad zorunlu"),
  email: Yup.string().email("Geçersiz email").required("Email zorunlu"),
});

const FormPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    // Örnek: async işlem simülasyonu (API çağrısı gibi)
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  const initialValues = {
    ad: "",
    soyad: "",
    email: "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {/* ✅ Formu karta sarıyoruz */}
      <Card
        title="Kullanıcı Bilgileri"
        column={12}
        className="background-color-form"
      >
        <Form className="form-grid">
          <Field name="ad">
            {({ field }: FieldProps) => (
              <Input {...field} label="Ad" column={6} />
            )}
          </Field>

          <Field name="soyad">
            {({ field }: FieldProps) => (
              <Input {...field} label="Soyad" column={6} />
            )}
          </Field>

          <Field name="email">
            {({ field }: FieldProps) => (
              <Input {...field} label="Email" type="email" column={12} />
            )}
          </Field>

          <Button
            type="submit"
            className="my-button-style secondary col-3"
            loading={isLoading}
            onClick={handleClick}
          >
            Sent
          </Button>
        </Form>{" "}
      </Card>
    </Formik>
  );
};

export default FormPage;
