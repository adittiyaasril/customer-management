"use client";

import { Card, CardHeader, CardBody } from "@nextui-org/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Spacer } from "@nextui-org/spacer";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Pagination } from "@nextui-org/pagination";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/customer";
import { SearchIcon } from "@/components/icons";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTablePage, setCurrentTablePage] = useState<number>(1);
  const [currentCardPage, setCurrentCardPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("nama");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    customerId: number | null;
  }>({
    isOpen: false,
    customerId: null,
  });
  const itemsPerPage = 6;
  const router = useRouter();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers.filter(
      (customer) =>
        customer.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterOption !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status_warga === filterOption
      );
    }

    setFilteredCustomers(filtered);
    setCurrentTablePage(1);
    setCurrentCardPage(1);
  }, [searchQuery, customers, filterOption]);

  const handleEdit = (customerId: number) => {
    router.push(`/customers/edit/${customerId}`);
  };

  const handleDelete = async (customerId: number) => {
    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: customerId }),
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      fetchCustomers();
      setDeleteModal({ isOpen: false, customerId: null });
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const confirmDelete = (customerId: number) => {
    setDeleteModal({ isOpen: true, customerId });
  };

  const sortedCustomers = filteredCustomers.sort((a, b) => {
    if (sortOption === "nama") {
      return a.nama.localeCompare(b.nama);
    } else if (sortOption === "email") {
      return a.email.localeCompare(b.email);
    } else if (sortOption === "telepon") {
      return a.telepon.localeCompare(b.telepon);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const displayedTableCustomers = sortedCustomers.slice(
    (currentTablePage - 1) * itemsPerPage,
    currentTablePage * itemsPerPage
  );
  const displayedCardCustomers = sortedCustomers.slice(
    (currentCardPage - 1) * itemsPerPage,
    currentCardPage * itemsPerPage
  );

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <CardHeader>
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-4">
              <h3>Customer List</h3>
              <div className="text-sm text-default-500">
                Total: {sortedCustomers.length} customers
                {sortedCustomers.length !== customers.length && (
                  <span> (Filtered from {customers.length})</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Input
                size="sm"
                placeholder="Search..."
                endContent={
                  <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="ghost">
                    Sort:{" "}
                    {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort Options"
                  onAction={(key) => setSortOption(key as string)}
                >
                  <DropdownItem key="nama">Name</DropdownItem>
                  <DropdownItem key="email">Email</DropdownItem>
                  <DropdownItem key="telepon">Phone</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="ghost">
                    Filter: {filterOption === "all" ? "All" : filterOption}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filter Options"
                  onAction={(key) => setFilterOption(key as string)}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="WNI">WNI</DropdownItem>
                  <DropdownItem key="WNA">WNA</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Button onPress={() => router.push("/customers/add")} color="primary">
            Add New Customer
          </Button>
          <Spacer y={2} />
          <Tabs aria-label="Customer Data Tabs">
            <Tab key="table" title="Customer Table">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableColumn>Name</TableColumn>
                      <TableColumn>Email</TableColumn>
                      <TableColumn>Phone</TableColumn>
                      <TableColumn>Status</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {displayedTableCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <a
                              href={`/customers/${customer.id}`}
                              className="text-blue-500 hover:underline"
                            >
                              {customer.nama}
                            </a>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.telepon}</TableCell>
                          <TableCell>{customer.status_warga}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => handleEdit(customer.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => confirmDelete(customer.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-center mt-4">
                    <Pagination
                      total={totalPages}
                      page={currentTablePage}
                      onChange={(page) => setCurrentTablePage(page)}
                    />
                  </div>
                </>
              )}
            </Tab>

            <Tab key="cards" title="Customer Cards">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedCardCustomers.map((customer) => (
                      <Card key={customer.id} shadow="sm" className="relative">
                        <CardBody>
                          <h3 className="text-lg font-bold">
                            <a
                              href={`/customers/${customer.id}`}
                              className="text-blue-500 hover:underline"
                            >
                              {customer.nama}
                            </a>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {customer.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.telepon}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.status_warga}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => handleEdit(customer.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => confirmDelete(customer.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4">
                    <Pagination
                      total={totalPages}
                      page={currentCardPage}
                      onChange={(page) => setCurrentCardPage(page)}
                    />
                  </div>
                </>
              )}
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customerId: null })}
      >
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() =>
                setDeleteModal({ isOpen: false, customerId: null })
              }
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={() =>
                deleteModal.customerId && handleDelete(deleteModal.customerId)
              }
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
