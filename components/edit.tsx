"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Customer } from "@/types/customer";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";

const EditCustomerPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_lahir: "",
    status_warga: "",
    negara: "",
    foto: "",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/customers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch customer");
        }
        const data = await response.json();
        setCustomer(data);
        setFormData({
          nama: data.nama || "",
          email: data.email || "",
          telepon: data.telepon || "",
          alamat: data.alamat || "",
          tanggal_lahir: data.tanggal_lahir || "",
          status_warga: data.status_warga || "",
          negara: data.negara || "",
          foto: data.foto || "",
        });
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update customer");
      }

      alert("Customer updated successfully!");
      router.push("/customers");
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update customer"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <CardHeader>
          <h3>Edit Customer</h3>
        </CardHeader>
        <CardBody>
          <Input
            label="Name"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            placeholder="Enter customer name"
          />
          <Spacer y={1} />
          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter customer email"
          />
          <Spacer y={1} />
          <Input
            label="Phone"
            name="telepon"
            value={formData.telepon}
            onChange={handleInputChange}
            placeholder="Enter customer phone"
          />
          <Spacer y={1} />
          <Input
            label="Address"
            name="alamat"
            value={formData.alamat}
            onChange={handleInputChange}
            placeholder="Enter customer address"
          />
          <Spacer y={1} />
          <Input
            label="Date of Birth"
            name="tanggal_lahir"
            value={formData.tanggal_lahir}
            onChange={handleInputChange}
            placeholder="Enter customer date of birth"
          />
          <Spacer y={1} />
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={updating}
            disabled={updating}
          >
            Save Changes
          </Button>
          <Spacer x={1} />
          <Button color="danger" onClick={() => router.push("/customers")}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditCustomerPage;
