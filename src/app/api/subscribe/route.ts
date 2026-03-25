import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json();

    // Validate
    if (!email || !name) {
      return Response.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.MAILERLITE_API_KEY;

    // Map each dropdown value to its env variable
    const groupMap: Record<string, string | undefined> = {
      public: process.env.MAILERLITE_GROUP_PUBLIC,
      dentist: process.env.MAILERLITE_GROUP_DENTIST,
      industry: process.env.MAILERLITE_GROUP_INDUSTRY,
      government: process.env.MAILERLITE_GROUP_GOVERNMENT,
      philanthropy: process.env.MAILERLITE_GROUP_PHILANTHROPY,
    };

    if (!API_KEY) {
      console.error("MAILERLITE_API_KEY is not set");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Resolve group ID from role, skip if role not selected or env not set
    const groupId = role ? groupMap[role] : undefined;
    const groups = groupId ? [groupId] : [];

    // Call MailerLite API
    const mlResponse = await fetch(
      "https://connect.mailerlite.com/api/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email,
          fields: {
            name,
          },
          groups,
          status: "active",
        }),
      }
    );

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json();
      console.error("MailerLite error:", errorData);
      return Response.json(
        { error: "Failed to subscribe. Please try again." },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();
    return Response.json(
      { success: true, message: "Thank you for your support!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
