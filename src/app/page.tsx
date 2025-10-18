import Image from "next/image";
import LoginForm from "./LoginForm";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e3eafc 0%, #f5f8ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="text-center mb-4">
        <Image
          src="/gwclogo.png"
          alt="HRMS Logo"
          width={100}
          height={100}
          style={{ marginBottom: 12 }}
        />
        <h2 className="fw-bold mb-1 text-black" style={{ fontSize: 32 }}>
          Golden West Colleges HRMS
        </h2>
        <div className="text-black" style={{ fontSize: 18 }}>
          Sign in to your account
        </div>
      </div>
      <div
        className="mx-auto p-4 bg-white rounded shadow-sm"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <h4 className="fw-bold mb-1 text-black">Welcome Back</h4>
        <div className="mb-3 text-black" style={{ fontSize: 15 }}>
          Enter your credentials to access the system
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
