// pages/ExpenseTracker.tsx
import { Formik, Form, Field, type FieldProps } from "formik";
import * as Yup from "yup";
import { useMemo, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Table, { type Column } from "../../components/Table";

type Category = "Groceries" | "Utilities" | "Entertainment" | "Other";
type Row = {
  id: string;
  description: string;
  amount: number;
  category: Category;
};

const categories: Category[] = [
  "Groceries",
  "Utilities",
  "Entertainment",
  "Other",
];

const schema = Yup.object({
  description: Yup.string().required("Required"),
  amount: Yup.number().typeError("Number").positive().required("Required"),
  category: Yup.mixed<Category>()
    .oneOf(categories as any)
    .required("Required"),
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ExpenseTracker() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: crypto.randomUUID(),
      description: "Milk",
      amount: 5,
      category: "Groceries",
    },
    {
      id: crypto.randomUUID(),
      description: "Internet",
      amount: 20,
      category: "Utilities",
    },
  ]);
  const [filter, setFilter] = useState<"All" | Category>("All");

  const handleDelete = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const columns: Column<Row>[] = [
    { key: "description", header: "Description", sortable: true },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      render: (r) => currency.format(r.amount),
    },
    { key: "category", header: "Category", sortable: true },
    {
      key: "actions",
      header: "",
      width: 120,
      render: (r) => (
        <Button
          variant="error"
          size="sm"
          className="w-auto"
          onClick={() => handleDelete(r.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const filtered = useMemo(
    () => (filter === "All" ? rows : rows.filter((r) => r.category === filter)),
    [rows, filter]
  );

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [filtered]
  );

  return (
    <>
      {/* Form */}
      <Formik
        initialValues={{ description: "", amount: "", category: "" }}
        validationSchema={schema}
        onSubmit={(vals, { resetForm }) => {
          setRows((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              description: vals.description,
              amount: Number(vals.amount),
              category: vals.category as Category,
            },
          ]);
          resetForm();
        }}
      >
        {({ isSubmitting }) => (
          <Card column={12}>
            <Form className="form-grid">
              <Field name="description">
                {({ field, meta }: FieldProps) => (
                  <Input
                    {...field}
                    id="description"
                    label="Description"
                    column={4}
                    placeholder="Enter description"
                    error={
                      meta.touched && meta.error
                        ? String(meta.error)
                        : undefined
                    }
                  />
                )}
              </Field>

              <Field name="amount">
                {({ field, meta }: FieldProps) => (
                  <Input
                    {...field}
                    type="number"
                    id="amount"
                    label="Amount"
                    column={4}
                    placeholder="Enter amount"
                    error={
                      meta.touched && meta.error
                        ? String(meta.error)
                        : undefined
                    }
                  />
                )}
              </Field>

              <Field name="category">
                {({ field, meta }: FieldProps) => (
                  <Select
                    id="category"
                    label="Category"
                    column={4}
                    placeholder="Select category"
                    options={categories.map((c) => ({ value: c, label: c }))}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={
                      meta.touched && meta.error
                        ? String(meta.error)
                        : undefined
                    }
                  />
                )}
              </Field>

              <div className="form-grid__actions">
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-auto"
                  loading={isSubmitting}
                >
                  Add
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </Formik>

      {/* Filter + Table */}
      <Card className="col-12">
        <div className="form-grid" style={{ marginBottom: 8 }}>
          <Select
            id="filter"
            label=""
            className="col-12"
            placeholder="All categories"
            options={[
              { value: "All", label: "All categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilter(e.target.value as "All" | Category)
            }
          />
        </div>

        <Table
          columns={columns}
          data={filtered}
          size="md"
          striped
          hoverable
          stickyHeader
          pagination={{ pageSize: 10 }}
          defaultSort={{ key: "description", direction: "asc" }}
          summary={`Total: ${currency.format(total)}`}
        />
      </Card>
    </>
  );
}
