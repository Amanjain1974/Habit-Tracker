import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, mobile } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mobile: mobile ? mobile : undefined }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email or mobile already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile: mobile || null,
      },
    });

    return NextResponse.json({ message: "User registered successfully", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
