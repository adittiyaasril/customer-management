"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Customer } from "@/types/customer";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import Image from "next/image";

const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return <div className="p-4">Customer not found</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="w-full">
        <CardHeader className="border-b border-divider">
          <h3 className="text-xl font-semibold">Customer Details</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - Photo */}
            <div className="w-full md:w-1/3">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={customer.foto || "/user.jpg"}
                  alt="Customer Photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
            </div>

            {/* Right side - Details */}
            <div className="w-full md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{customer.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.telepon}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{customer.tanggal_lahir}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Citizenship Status</p>
                  <p className="font-medium">{customer.status_warga}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{customer.negara}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{customer.alamat}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter className="border-t border-divider">
          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={() => router.push(`/customers/edit/${id}`)}
            >
              Edit
            </Button>
            <Button
              variant="bordered"
              onPress={() => router.push("/customers")}
            >
              Back to List
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerDetailPage;
