"use client";
const Page = () => {
  const handleClick = async () => {
    try {
      // const res = await api.get("/test");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      Test
      <button onClick={handleClick}>click</button>
    </div>
  );
};

export default Page;
