export const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Regenbogen
            <img
              className="w-12 ml-3 inline-block relative"
              src="logo.svg"
              style={{ bottom: "0.12em" }}
            />
          </h1>
        </div>
      </div>
    </div>
  );
};
