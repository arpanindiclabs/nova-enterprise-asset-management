import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center ">
          {/* Logo 2x bigger than before (112 x 112) */}
          <div className="w-112 h-112 relative" style={{ width: "448px", height: "448px" }}>
            <Image
              src="/logo.png" // your logo path
              alt="Al Naba IT Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Smaller heading with normal dark color */}
          <h1 className="text-lg font-semibold text-center text-gray-900">
            Welcome to <br />
            Al Naba IT — <br />
            Enterprise Asset Management
          </h1>

          {/* Subheading slightly bigger than before */}
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Manage your assets efficiently with ease and control.
          </p>
        </CardContent>

        <CardFooter className="flex justify-around">
          <Link href="/login" passHref>
            <Button variant="outline" as="a">
              Login
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="default" as="a">
              Register
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
