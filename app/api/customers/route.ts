import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { Database } from "../../../lib/database.types";
import { validate as isUUID } from "uuid";

export async function GET() {
  try {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Database["public"]["Tables"]["customers"]["Insert"] =
      await req.json();

    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("email")
      .eq("email", body.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("customers").insert([body]);
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    // Validate UUID
    if (!id || !isUUID(id)) {
      return NextResponse.json(
        { error: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    // First check if the customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "No customer found with the provided ID" },
        { status: 404 }
      );
    }

    // Delete customer
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
