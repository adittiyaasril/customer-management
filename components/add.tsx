"use client";
import React, { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "ID", name: "Indonesia" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "MY", name: "Malaysia" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "RU", name: "Russia" },
  { code: "SG", name: "Singapore" },
  { code: "US", name: "United States" },
];

type CustomerForm = {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggal_lahir: string;
  status_warga: "WNI" | "WNA";
  negara?: string;
  foto?: string;
};

const CustomerFormPage = () => {
  const [form, setForm] = useState<CustomerForm>({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggal_lahir: "",
    status_warga: "WNI",
    negara: "",
    foto: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tanggal_lahir") {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      if (selectedDate > currentDate) {
        setError("Tanggal lahir tidak boleh lebih dari hari ini");
        return;
      } else {
        setError(null);
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setForm({
      ...form,
      status_warga: value as "WNI" | "WNA",
      negara: value === "WNI" ? "" : form.negara,
    });
  };

  const handleCountryChange = (value: string) => {
    setForm({ ...form, negara: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Save file to form state
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, foto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (
        !form.nama ||
        !form.email ||
        !form.telepon ||
        !form.alamat ||
        !form.tanggal_lahir
      ) {
        throw new Error("All fields are required.");
      }

      if (form.status_warga === "WNA" && !form.negara) {
        throw new Error("Country is required for WNA.");
      }

      const birthDate = new Date(form.tanggal_lahir);
      const currentDate = new Date();
      if (birthDate > currentDate) {
        throw new Error("Tanggal lahir tidak boleh lebih dari hari ini");
      }
      // Upload foto ke storage jika ada
      let fotoUrl = null;
      if (form.foto) {
        const fileBase64 = form.foto.split(",")[1];
        const fileName = `${Date.now()}-${form.nama.toLowerCase().replace(/\s+/g, "-")}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("customer-photos")
          .upload(fileName, decode(fileBase64), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("customer-photos").getPublicUrl(fileName);

        fotoUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("customers").insert([
        {
          ...form,
          foto: fotoUrl,
        },
      ]);

      if (insertError) throw insertError;

      router.push("/customers");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Input Data Customer</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="nama"
          label="Nama Lengkap"
          value={form.nama}
          onChange={handleInputChange}
          isRequired
        />
        <Input
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleInputChange}
          isRequired
        />
        <Input
          name="telepon"
          type="tel"
          label="Nomor Telepon"
          value={form.telepon}
          onChange={handleInputChange}
          isRequired
        />
        <Input
          name="alamat"
          label="Alamat"
          value={form.alamat}
          onChange={handleInputChange}
          isRequired
        />
        <Input
          name="tanggal_lahir"
          type="date"
          label="Tanggal Lahir"
          value={form.tanggal_lahir}
          onChange={handleInputChange}
          isRequired
        />
        <Select
          label="Status Warga"
          defaultSelectedKeys={[form.status_warga]}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          <SelectItem key="WNI" value="WNI">
            WNI
          </SelectItem>
          <SelectItem key="WNA" value="WNA">
            WNA
          </SelectItem>
        </Select>
        {form.status_warga === "WNA" && (
          <Select
            label="Negara"
            placeholder="Pilih Negara"
            selectedKeys={form.negara ? [form.negara] : []}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full"
            isRequired
            items={countries}
          >
            {(country) => (
              <SelectItem key={country.name} value={country.name}>
                {country.name}
              </SelectItem>
            )}
          </Select>
        )}
        <div className="space-y-2">
          <Input
            name="foto"
            type="file"
            label="Foto"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="relative w-32 h-32">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
        <Button
          className="w-full p-2"
          type="submit"
          color="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default CustomerFormPage;

// Helper function untuk decode base64
function decode(base64: string) {
  const buff = Buffer.from(base64, "base64");
  return buff;
}
