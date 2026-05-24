async function getHealth() {
  try {
    const response = await fetch("http://localhost:5000/health", {
      cache: "no-store",
    });

    return response.json();
  } catch (error) {
    return {
      success: false,
      message: "Backend not connected",
    };
  }
}

export default async function Home() {
  const data = await getHealth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-6">
        DevPlatform
      </h1>

      <div className="flex items-center gap-3 text-xl">
        <div
          className={`w-4 h-4 rounded-full ${
            data.success ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <div
          className={`w-4 h-4 rounded-full ${
            data.success ? "bg-red-500" : "bg-green-500"
          }`}
        />
        <div
          className={`w-4 h-4 rounded-full ${
            data.success ? "bg-green-500" : "bg-red-500"
          }`}
        />

        <p>{data.message}</p>
        <p>#devplaform</p>
      </div>
    </main>
  );
}