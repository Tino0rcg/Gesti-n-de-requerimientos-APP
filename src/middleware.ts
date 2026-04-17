import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware desactivado temporalmente a petición del usuario
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
