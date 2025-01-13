import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validate as isUUID } from "uuid";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;

  if (!id || !isUUID(id)) {
    return NextResponse.json(
      { error: "Invalid or missing ID" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;
  console.log("Updating customer with ID:", id);

  if (!id || !isUUID(id)) {
    console.log("Invalid UUID:", id);
    return NextResponse.json(
      { error: "Invalid or missing ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    console.log("Update data received:", body);

    const updateData = {
      nama: body.nama,
      email: body.email,
      telepon: body.telepon,
    };

    // Check if customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError) {
      console.log("Error checking existing customer:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingCustomer) {
      console.log("Customer not found with ID:", id);
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    console.log("Existing customer found:", existingCustomer);

    // Check for email uniqueness if email is changed
    if (body.email !== existingCustomer.email) {
      const { data: emailCheck, error: emailError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.email)
        .single();

      if (emailError && emailError.code !== "PGRST116") {
        console.log("Error checking email uniqueness:", emailError);
        return NextResponse.json(
          { error: emailError.message },
          { status: 500 }
        );
      }

      if (emailCheck) {
        console.log("Email already in use:", body.email);
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Perform update
    console.log("Attempting to update with data:", updateData);
    const { data, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.log("Error updating customer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.length === 0) {
      console.log("No rows updated");
      return NextResponse.json({ error: "No rows updated" }, { status: 500 });
    }

    console.log("Update successful:", data);
    return NextResponse.json({
      message: "Customer updated successfully",
      data: data[0],
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
