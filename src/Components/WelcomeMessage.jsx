function WelcomeMessage(props) {
  return (
    <>
      <div
        className="text-center p-3 bg-dark text-white link-title"
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // إضافة الظل لجعل المربع يظهر أكثر بروزًا
          borderRadius: "8px", // إضافة حواف مدورة
        }}
      >
        <h1>{props.message}</h1>
      </div>
    </>
  );
}

export default WelcomeMessage;
