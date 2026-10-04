import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { appointmentSchema } from "@/lib/schemas/appointment";

async function account() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

export async function GET() {
  const auth = await account();
  if (!auth) return Response.json({ error: "Sign in to view appointments." }, { status: 401 });
  const { data, error } = await auth.supabase.from("appointments").select("id,provider_name,provider_address,provider_phone,appointment_date,appointment_time,status,note").eq("user_id", auth.user.id).order("appointment_date");
  if (error) return Response.json({ error: "Could not load appointments. Apply the latest database migration." }, { status: 503 });
  return Response.json({ appointments: data.map((row) => ({ id: row.id, providerName: row.provider_name, providerAddress: row.provider_address, providerPhone: row.provider_phone, date: row.appointment_date, time: row.appointment_time.slice(0, 5), status: row.status, note: row.note })) });
}

export async function POST(request: Request) {
  const auth = await account();
  if (!auth) return Response.json({ error: "Sign in to save an appointment." }, { status: 401 });
  const parsed = appointmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a provider, date, and time." }, { status: 400 });
  const appointment = parsed.data;
  const { error } = await auth.supabase.from("appointments").upsert({ id: appointment.id, user_id: auth.user.id, provider_name: appointment.providerName, provider_address: appointment.providerAddress, provider_phone: appointment.providerPhone, appointment_date: appointment.date, appointment_time: appointment.time, status: appointment.status, note: appointment.note }, { onConflict: "id" });
  if (error) return Response.json({ error: "Could not save the appointment. Apply the latest database migration." }, { status: 503 });
  return Response.json({ appointment });
}

export async function DELETE(request: Request) {
  const auth = await account();
  if (!auth) return Response.json({ error: "Sign in to remove an appointment." }, { status: 401 });
  const parsed = z.uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!parsed.success) return Response.json({ error: "Invalid appointment." }, { status: 400 });
  const { error } = await auth.supabase.from("appointments").delete().eq("id", parsed.data).eq("user_id", auth.user.id);
  if (error) return Response.json({ error: "Could not remove the appointment." }, { status: 503 });
  return Response.json({ deleted: true });
}
