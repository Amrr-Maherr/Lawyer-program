import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Modal = ({
  isOpen,
  title,
  onClose,
  children,
  modalSize = "modal-dialog",
}) => {
  return (
    <div
      className={`modal fade ${isOpen ? "show" : ""}`}
      tabIndex="-1"
      aria-hidden={!isOpen}
      style={{ display: isOpen ? "block" : "none" }}
    >
      <div
        className={`modal-dialog ${modalSize}`}
        style={{
          maxWidth: modalSize.includes("modal-lg") ? "80%" : "initial",
        }}
      >
        <div
          className="modal-content"
          style={{
            borderWidth: "3px",
            borderColor: "#64b5f6", // لون حواف المودال
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            className="modal-header"
            style={{
              padding: "15px",
              backgroundColor: "#1a237e", // لون خلفية الهيدر
              color: "#fff", // لون نص الهيدر
            }}
          >
            <h5
              className="modal-title text-end w-100"
              style={{ fontSize: "1.4rem" }}
            >
              {title}
            </h5>
          </div>
          <div className="modal-body" dir="rtl" style={{ padding: "20px" }}>
            {children}
          </div>
          <div className="modal-footer" style={{ padding: "15px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: "1.1rem" }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const apiRequest = async (url, method, data = null, headers = {}, navigate) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error("API request failed:", error);
    let errorMessage = "حدث خطأ غير متوقع أثناء تنفيذ العملية.";

    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/SignUp");
        return;
      }
      errorMessage = error.response.data.message || "حدث خطأ غير متوقع.";
    } else if (error.request) {
      errorMessage =
        "لا يمكن الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت.";
    }

    Swal.fire({
      icon: "error",
      title: "فشل في العملية",
      text: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

// Reusable input component
const FormInput = React.memo(
  ({ label, name, type = "text", value, onChange, options = null }) => {
    const inputType = type === "select" ? "select" : "input";

    return (
      <div className="mb-3">
        <label className="form-label text-end w-100">{label}</label>
        {inputType === "input" ? (
          <input
            type={type}
            className="form-control text-end"
            name={name}
            value={value}
            onChange={onChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
            }}
          />
        ) : (
          <select
            className="form-select text-end"
            name={name}
            value={value}
            onChange={onChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف القائمة المنسدلة
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }
);
const Cases = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    title: "",
    date: "",
    amount: "",
    method: "cash",
    customerId: null,
    caseId: null,
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    date: "",
    description: "",
    customerId: null,
    caseId: null,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    case_number: "",
    opponent_name: "",
    opponent_phone: "",
    opponent_nation: "",
    opponent_address: "",
    opponent_lawyer: "",
    lawyer_phone: "",
    court_name: "",
    judge_name: "",
    case_title: "",
    notes: "",
    contract_price: "",
    case_category: "",
    name: "",
    email: "",
    ID_number: "",
    phone: "",
    address: "",
    nationality: "",
    company_name: "",
    notes: "",
    customerId: null,
    caseId: null,
  });
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentData, setAttachmentData] = useState({
    file: null,
    title: "",
    customerId: null,
    caseId: null,
  });
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [caseExpenses, setCaseExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [addExpenseData, setAddExpenseData] = useState({
    title: "",
    date: "",
    amount: "",
    customerId: null,
    caseId: null,
  });
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState({
    title: "",
    date: "",
    amount: "",
    customerId: null,
    caseId: null,
    expenseId: null,
  });

  useEffect(() => {
    const fetchCases = async () => {
      Swal.fire({
        title: "جاري تحميل بيانات القضايا",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const response = await apiRequest(
          "https://law-office.al-mosa.com/api/cases",
          "get",
          null,
          {},
          navigate
        );
        setData(response.cases);
        setLoading(false);
        Swal.close();
      } catch (err) {
        setError("فشل في استرجاع البيانات");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "فشل في تحميل بيانات القضايا",
          text: "حدث خطأ أثناء جلب البيانات، يرجى المحاولة مرة أخرى.",
        });
      }
    };
    fetchCases();
  }, [navigate]);

  const handleDetails = async (customerId, caseId) => {
    Swal.fire({
      title: "جاري تحميل تفاصيل القضية",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
        "get",
        null,
        {},
        navigate
      );
      setSelectedCase(response);
      setShowModal(true);
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "فشل في تحميل تفاصيل القضية",
        text: "حدث خطأ أثناء جلب تفاصيل القضية، يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCase(null);
  };

  const handleDelete = (customerId, caseId) => {
    Swal.fire({
      title: "هل أنت متأكد من حذف القضية؟",
      text: "لن يمكنك استرجاع هذه القضية بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف القضية!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(
            `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
            "delete",
            null,
            {},
            navigate
          );

          setData(data.filter((item) => item.case_id !== caseId));
          Swal.fire("تم حذف القضية بنجاح!", "", "success");
        } catch (error) {
          Swal.fire(
            "حدث خطأ!",
            "لم يتم حذف القضية بنجاح، يرجى المحاولة مرة أخرى.",
            "error"
          );
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPaymentModal = (customerId, caseId) => {
    setPaymentData((prev) => ({ ...prev, customerId, caseId }));
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData({
      title: "",
      date: "",
      amount: "",
      method: "cash",
      customerId: null,
      caseId: null,
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async () => {
    const { customerId, caseId, title, date, amount, method } = paymentData;

    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-payment`,
        "post",
        { title, date, amount, method },
        {},
        navigate
      );

      setData((prevData) => {
        return prevData.map((item) => {
          if (item.customer_id === customerId && item.case_id === caseId) {
            return {
              ...item,
              paid_amount: parseFloat(item.paid_amount) + parseFloat(amount),
              remaining_amount:
                parseFloat(item.remaining_amount) - parseFloat(amount),
            };
          }
          return item;
        });
      });
      Swal.fire("تمت عملية الدفع بنجاح!", "", "success");
      handleClosePaymentModal();
    } catch (error) {}
  };

  const handleOpenSessionModal = (customerId, caseId) => {
    setSessionData((prev) => ({ ...prev, customerId, caseId }));
    setShowSessionModal(true);
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    setSessionData({
      title: "",
      date: "",
      description: "",
      customerId: null,
      caseId: null,
    });
  };

  const handleSessionInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSessionSubmit = async () => {
    const { customerId, caseId, title, date, description } = sessionData;
    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-session`,
        "post",
        { title, date, description },
        {},
        navigate
      );
      Swal.fire("تمت إضافة الجلسة بنجاح!", "", "success");
      handleCloseSessionModal();
    } catch (error) {}
  };
  const handleOpenEditModal = (item) => {
    setEditData({
      case_number: item.case_number,
      opponent_name: item.opponent_name,
      opponent_phone: item.opponent_phone,
      opponent_nation: item.opponent_nation,
      opponent_address: item.opponent_address,
      opponent_lawyer: item.opponent_lawyer,
      lawyer_phone: item.lawyer_phone,
      court_name: item.court_name,
      judge_name: item.judge_name,
      case_title: item.case_title,
      notes: item.notes,
      contract_price: item.contract_price,
      case_category: item.case_category,
      name: item.customer_name,
      email: item.customer_email,
      ID_number: item.customer_ID_number,
      phone: item.customer_phone,
      address: item.customer_address,
      nationality: item.customer_nationality,
      company_name: item.customer_company_name,
      notes: item.customer_notes,
      customerId: item.customer_id,
      caseId: item.case_id,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditData({
      case_number: "",
      opponent_name: "",
      opponent_phone: "",
      opponent_nation: "",
      opponent_address: "",
      opponent_lawyer: "",
      lawyer_phone: "",
      court_name: "",
      judge_name: "",
      case_title: "",
      notes: "",
      contract_price: "",
      case_category: "",
      name: "",
      email: "",
      ID_number: "",
      phone: "",
      address: "",
      nationality: "",
      company_name: "",
      notes: "",
      customerId: null,
      caseId: null,
    });
    setSelectedCase(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const {
      customerId,
      caseId,
      case_number,
      opponent_name,
      opponent_phone,
      opponent_nation,
      opponent_address,
      opponent_lawyer,
      lawyer_phone,
      court_name,
      judge_name,
      case_title,
      notes,
      contract_price,
      case_category,
      name,
      email,
      ID_number,
      phone,
      address,
      nationality,
      company_name,
      notes: customer_notes,
    } = editData;

    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/update-case/${caseId}`,
        "post",
        {
          case_number,
          opponent_name,
          opponent_phone,
          opponent_nation,
          opponent_address,
          opponent_lawyer,
          lawyer_phone,
          court_name,
          judge_name,
          case_title,
          notes,
          contract_price,
          case_category,
          name,
          email,
          ID_number,
          phone,
          address,
          nationality,
          company_name,
          notes: customer_notes,
        },
        {},
        navigate
      );
      setData((prevData) => {
        return prevData.map((item) => {
          if (item.customer_id === customerId && item.case_id === caseId) {
            return {
              ...item,
              case_number: case_number,
              opponent_name: opponent_name,
              opponent_phone: opponent_phone,
              opponent_nation: opponent_nation,
              opponent_address: opponent_address,
              opponent_lawyer: opponent_lawyer,
              lawyer_phone: lawyer_phone,
              court_name: court_name,
              judge_name: judge_name,
              case_title: case_title,
              notes: notes,
              contract_price: contract_price,
              case_category: case_category,
              customer_name: name,
              customer_email: email,
              customer_ID_number: ID_number,
              customer_phone: phone,
              customer_address: address,
              customer_nationality: nationality,
              customer_company_name: company_name,
              customer_notes: customer_notes,
            };
          }
          return item;
        });
      });

      Swal.fire("تم تعديل بيانات القضية بنجاح!", "", "success");
    } catch (error) {}
    handleCloseEditModal();
  };
  const handleOpenAttachmentModal = (customerId, caseId) => {
    setAttachmentData((prev) => ({ ...prev, customerId, caseId }));
    setShowAttachmentModal(true);
  };

  const handleCloseAttachmentModal = () => {
    setShowAttachmentModal(false);
    setAttachmentData({
      file: null,
      title: "",
      customerId: null,
      caseId: null,
    });
  };

  const handleAttachmentInputChange = (e) => {
    const { name, type } = e.target;
    let value = type === "file" ? e.target.files[0] : e.target.value;
    setAttachmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttachmentSubmit = async () => {
    const { customerId, caseId, file, title } = attachmentData;
    if (!file) {
      Swal.fire("خطأ", "يجب عليك إختيار ملف أولا!", "error");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      Swal.fire("خطأ", "يجب أن يكون الملف صورة أو ملف PDF", "error");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-attachment`,
        "post",
        formData,
        { "Content-Type": "multipart/form-data" },
        navigate
      );
      Swal.fire("تمت إضافة المرفق بنجاح!", "", "success");
    } catch (error) {}
    handleCloseAttachmentModal();
  };
  const handleViewExpenses = async (customerId, caseId) => {
    Swal.fire({
      title: "جاري تحميل مصروفات القضية",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/case-expenses`,
        "get",
        null,
        {},
        navigate
      );
      console.log("API response for expenses:", response);
      setCaseExpenses(response.expenses);
      setTotalExpenses(parseFloat(response["مصروفات القضية الكلية"]));
      setShowExpensesModal(true);
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "فشل في تحميل مصروفات القضية",
        text: "حدث خطأ أثناء جلب مصروفات القضية، يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const handleCloseExpensesModal = () => {
    setShowExpensesModal(false);
    setCaseExpenses([]);
    setTotalExpenses(0);
  };
  const handleOpenAddExpenseModal = (customerId, caseId) => {
    setAddExpenseData((prev) => ({ ...prev, customerId, caseId }));
    setShowAddExpenseModal(true);
  };

  const handleCloseAddExpenseModal = () => {
    setShowAddExpenseModal(false);
    setAddExpenseData({
      title: "",
      date: "",
      amount: "",
      customerId: null,
      caseId: null,
    });
  };

  const handleAddExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setAddExpenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpenseSubmit = async () => {
    const { customerId, caseId, title, date, amount } = addExpenseData;
    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-expense`,
        "post",
        { title, date, amount },
        {},
        navigate
      );
      Swal.fire("تمت إضافة المصروف بنجاح!", "", "success");
      handleCloseAddExpenseModal();
    } catch (error) {
    } finally {
      setAddExpenseData({
        title: "",
        date: "",
        amount: "",
        customerId: null,
        caseId: null,
      });
    }
  };
  const handleDeleteExpense = async (customerId, caseId, expenseId) => {
    Swal.fire({
      title: "هل أنت متأكد من حذف المصروف؟",
      text: "لن يمكنك استرجاع هذا المصروف بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف المصروف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(
            `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/expense/${expenseId}`,
            "delete",
            null,
            {},
            navigate
          );

          // Filter out the deleted expense from the caseExpenses array
          setCaseExpenses(caseExpenses.filter((item) => item.id !== expenseId));

          Swal.fire("تم حذف المصروف بنجاح!", "", "success");
          const response = await apiRequest(
            `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/case-expenses`,
            "get",
            null,
            {},
            navigate
          );
          console.log("API response for expenses after delete:", response);
          setCaseExpenses(response.expenses);
          setTotalExpenses(parseFloat(response["مصروفات القضية الكلية"]));
        } catch (error) {
          Swal.fire(
            "حدث خطأ!",
            "لم يتم حذف المصروف بنجاح، يرجى المحاولة مرة أخرى.",
            "error"
          );
        }
      }
    });
  };
  const handleOpenEditExpenseModal = (customerId, caseId, expense) => {
    setEditExpenseData({
      title: expense.title,
      date: new Date(expense.date).toISOString().split("T")[0],
      amount: expense.amount,
      customerId: customerId,
      caseId: caseId,
      expenseId: expense.id,
    });
    setShowEditExpenseModal(true);
  };

  const handleCloseEditExpenseModal = () => {
    setShowEditExpenseModal(false);
    setEditExpenseData({
      title: "",
      date: "",
      amount: "",
      customerId: null,
      caseId: null,
      expenseId: null,
    });
  };

  const handleEditExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setEditExpenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditExpenseSubmit = async () => {
    const { customerId, caseId, title, date, amount, expenseId } =
      editExpenseData;
    try {
      await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/update-expense/${expenseId}`,
        "post",
        { title, date, amount },
        {},
        navigate
      );
      const response = await apiRequest(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/case-expenses`,
        "get",
        null,
        {},
        navigate
      );
      console.log("API response for expenses after edit:", response);
      setCaseExpenses(response.expenses);
      setTotalExpenses(parseFloat(response["مصروفات القضية الكلية"]));
      Swal.fire("تم تعديل المصروف بنجاح!", "", "success");
      handleCloseEditExpenseModal();
    } catch (error) {
      Swal.fire(
        "حدث خطأ!",
        "لم يتم تعديل المصروف بنجاح، يرجى المحاولة مرة أخرى.",
        "error"
      );
    }
  };
  if (loading) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid" style={{ backgroundColor: "#f0f0f0" }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 col-12 my-4 ">
            <input
              type="text"
              className="form-control w-100 w-md-50"
              placeholder="ابحث عن القضية"
              value={searchTerm}
              onChange={handleSearch}
              style={{
                borderWidth: "2px",
                borderColor: "#64b5f6", // لون حواف مربع البحث
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                fontSize: "1rem",
                padding: "10px",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>
          <div className="col-md-6 col-12 my-4  text-md-end text-center">
            <h2>بيانات القضايا</h2>
          </div>
        </div>
      </div>
      <div className="row row-cols- row-cols-1 row-cols-md-3 g-4 flex-row-reverse my-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div className="col" key={item.case_id}>
              <div className="card h-100 case-card" dir="rtl">
                {/* بداية رأس الكارت (Card Header) */}
                <div
                  className="card-header case-card-header  d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: "#1a237e", // لون خلفية رأس الكارت
                    color: "#fff", // لون نص رأس الكارت
                  }}
                >
                  {/* اسم العميل (نص ديناميكي) */}
                  <h5 className="card-title m-0 text-start flex-grow-1 ps-2 w-100 text-end">
                    {item.customer_name}
                  </h5>
                  {/* أيقونة المستخدم (فاصل بصري) */}
                  <i className="fas fa-user fs-4 me-2"></i>
                </div>
                {/* نهاية رأس الكارت (Card Header) */}

                {/* بداية جسم الكارت (Card Body) */}
                <div className="card-body">
                  {/* بداية تنسيق معلومات القضية باستخدام flexbox */}
                  <div className="d-flex flex-column gap-2">
                    {/* معلومات رقم الدعوى القضائية */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-file-invoice ms-2"></i>
                        رقم الدعوى القضائية:
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.case_number}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />

                    {/* معلومات فئة الدعوى */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-tags ms-2"></i>
                        فئة الدعوى:
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.case_category}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />

                    {/* معلومات أتعاب المحاماة (المتفق عليها) */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-coins ms-2"></i>
                        أتعاب المحاماة (المتفق عليها):
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.contract_price}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />

                    {/* معلومات رقم الهاتف الخاص بالموكل */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-phone ms-2"></i>
                        رقم الهاتف الخاص بالموكل:
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.customer_phone}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />

                    {/* معلومات المبالغ المسددة من الأتعاب */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-money-bill-wave ms-2"></i>
                        المبالغ المسددة من الأتعاب:
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.paid_amount}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />

                    {/* معلومات المبلغ المتبقي من الأتعاب */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="text-bold me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <i className="fas fa-hand-holding-usd ms-2"></i>
                        المبلغ المتبقي من الأتعاب:
                      </span>
                      <span className="text-start" style={{ fontSize: "1rem" }}>
                        {item.remaining_amount}
                      </span>
                    </div>
                    <hr className="my-2" style={{ margin: "5px 0" }} />
                  </div>
                  {/* نهاية تنسيق معلومات القضية باستخدام flexbox */}

                  {/* بداية منطقة أزرار الإجراءات */}
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {/* ... (أزرار الإجراءات لم تتغير) ... */}
                    <button
                      className="btn btn-info btn-smcase-button"
                      onClick={() =>
                        handleDetails(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-info-circle ms-1"></i> تفاصيل
                    </button>
                    {/* زر الحذف (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-danger btn-sm case-button"
                      onClick={() =>
                        handleDelete(item.customer_id, item.case_id)
                      }
                    >
                      {" "}
                      <i className="fa fa-trash-alt ms-1"></i> حذف
                    </button>
                    {/* زر الدفع (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-success btn-sm case-button"
                      onClick={() =>
                        handleOpenPaymentModal(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-money-bill ms-1"></i> دفع
                    </button>
                    {/* زر إضافة جلسة (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-primary btn-sm case-button"
                      onClick={() =>
                        handleOpenSessionModal(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-plus ms-1"></i> جلسة
                    </button>
                    {/* زر إضافة مرفق (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-secondary btn-sm case-button"
                      onClick={() =>
                        handleOpenAttachmentModal(
                          item.customer_id,
                          item.case_id
                        )
                      }
                    >
                      <i className="fa fa-paperclip ms-1"></i> مرفق
                    </button>
                    {/* زر التعديل (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-warning btn-sm case-button"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <i className="fafa-edit ms-1"></i> تعديل
                    </button>
                    {/* زر عرض المصاريف (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-secondary btn-sm case-button"
                      onClick={() =>
                        handleViewExpenses(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fas fa-coins ms-1"></i> المصاريف
                    </button>
                    {/* زر إضافة مصاريف جديدة (مع فاصل أيقونة ونص) */}
                    <button
                      className="btn btn-success btn-sm case-button"
                      onClick={() =>
                        handleOpenAddExpenseModal(
                          item.customer_id,
                          item.case_id
                        )
                      }
                    >
                      <i className="fas fa-plus ms-1"></i> مصاريف جديدة
                    </button>
                  </div>
                  {/* نهاية منطقة أزرار الإجراءات */}
                </div>
                {/* نهاية جسم الكارت (Card Body) */}
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            {searchTerm ? "لا توجد نتائج تطابق بحثك." : "لا توجد قضايا حالياً."}
          </div>
        )}
      </div>
      {/* Case Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        modalSize={"modal-dialog modal-dialog-scrollable"}
      >
        {selectedCase && (
          <div
            className="case-details-container"
            style={{
              fontFamily: "Arial",
              direction: "rtl",
              textAlign: "right",
              padding: "20px",
            }}
          >
            {/* Case Information Section */}
            <h3
              style={{
                marginBottom: "15px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.3em",
                borderBottom: "2px solid #eee",
                paddingBottom: "5px",
              }}
            >
              معلومات القضية
            </h3>
            <div
              className="case-info"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: "20px",
                justifyContent: "space-between",
              }}
            >
              <div
                className="form-group"
                style={{ width: "30%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  اسم المحكمة:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.court_name}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "30%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  رقم القضية:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.case_number}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "30%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  عنوان القضية:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.case_title}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "30%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  اسم القاضي:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.judge_name}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "30%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  فئة القضية:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case_category.name}
                </div>
              </div>
            </div>
            {/* Customer Information Section */}
            <h3
              style={{
                marginBottom: "15px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.3em",
                borderBottom: "2px solid #eee",
                paddingBottom: "5px",
              }}
            >
              معلومات العميل
            </h3>
            <div
              className="customer-info"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: "20px",
                justifyContent: "space-between",
              }}
            >
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  إسم العميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.name}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  عنوان العميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.address}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  البريد الالكتروني للعميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.email}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  رقم الهوية للعميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.ID_number}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  جنسية العميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.nationality}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  اسم شركة العميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.company_name}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  ملاحظات العميل:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.customer.notes}
                </div>
              </div>
            </div>

            {/* Opponent Information Section */}
            <h3
              style={{
                marginBottom: "15px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.3em",
                borderBottom: "2px solid #eee",
                paddingBottom: "5px",
              }}
            >
              معلومات الخصم
            </h3>
            <div
              className="opponent-info"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: "20px",
                justifyContent: "space-between",
              }}
            >
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  إسم الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_name}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  عنوان الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_address}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  نوع الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_type}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  هاتف الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_phone}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  جنسية الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_nation}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  اسم محامي الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.opponent_lawyer}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  هاتف محامي الخصم:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.lawyer_phone}
                </div>
              </div>
            </div>
            {/* Payment Information Section */}
            <h3
              style={{
                marginBottom: "15px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.3em",
                borderBottom: "2px solid #eee",
                paddingBottom: "5px",
              }}
            >
              معلومات الدفع
            </h3>
            <div
              className="payment-info"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: "20px",
                justifyContent: "space-between",
              }}
            >
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  اتعاب المحاماه:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.contract_price}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  المسدد من الاتعاب:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.paid_amount}
                </div>
              </div>
              <div
                className="form-group"
                style={{ width: "48%", marginBottom: "10px" }}
              >
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  المتبقي من الاتعاب:
                </label>
                <div
                  style={{
                    padding: "12px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.remaining_amount}
                </div>
              </div>
            </div>
            {/* Expenses Table */}
            <h3
              style={{
                marginBottom: "15px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "1.3em",
                borderBottom: "2px solid #eee",
                paddingBottom: "5px",
              }}
            >
              مصاريف القضية
            </h3>
            {selectedCase.case_expenses &&
              selectedCase.case_expenses.length > 0 && (
                <div
                  className="expenses-table"
                  style={{ marginBottom: "20px" }}
                >
                  <table
                    className="table table-bordered"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "20px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #ccc",
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          رقم المصروف
                        </th>
                        <th
                          style={{
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #ccc",
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          تاريخ المصروف
                        </th>
                        <th
                          style={{
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #ccc",
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          المبلغ
                        </th>
                        <th
                          style={{
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #ccc",
                            padding: "12px",
                            textAlign: "center",
                            fontSize: "1.2em",
                          }}
                        >
                          ملاحظات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCase.case_expenses.map((expense, index) => (
                        <tr key={expense.id}>
                          <td
                            style={{
                              border: "2px solid #ccc",
                              padding: "12px",
                              textAlign: "center",
                              fontSize: "1.2em",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            style={{
                              border: "2px solid #ccc",
                              padding: "12px",
                              textAlign: "center",
                              fontSize: "1.2em",
                            }}
                          >
                            {expense.date}
                          </td>
                          <td
                            style={{
                              border: "2px solid #ccc",
                              padding: "12px",
                              textAlign: "center",
                              fontSize: "1.2em",
                            }}
                          >
                            {expense.amount}
                          </td>
                          <td
                            style={{
                              border: "2px solid #ccc",
                              padding: "12px",
                              textAlign: "center",
                              fontSize: "1.2em",
                            }}
                          >
                            {expense.title}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            {/* Footer Information */}
            <div
              className="footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "2px solid #ccc",
                paddingTop: "15px",
                marginTop: "25px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  آخر ما تم في القضية:
                </label>
                <div
                  style={{
                    padding: "10px",
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "1.2em",
                  }}
                >
                  {selectedCase.case.notes}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        title="إضافة دفعة"
        onClose={handleClosePaymentModal}
      >
        <div className="mb-3">
          <label className="form-label text-end w-100">عنوان الدفعة</label>
          <input
            type="text"
            className="form-control text-end"
            name="title"
            value={paymentData.title}
            onChange={handlePaymentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">تاريخ الدفعة</label>
          <input
            type="date"
            className="form-control text-end"
            name="date"
            value={paymentData.date}
            onChange={handlePaymentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">المبلغ</label>
          <input
            type="number"
            className="form-control text-end"
            name="amount"
            value={paymentData.amount}
            onChange={handlePaymentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">طريقة الدفع</label>
          <select
            className="form-select text-end"
            name="method"
            value={paymentData.method}
            onChange={handlePaymentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          >
            <option value="cash">كاش</option>
            <option value="credit card">بطاقة ائتمان</option>
            <option value="bank transfer">تحويل بنكي</option>
          </select>
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClosePaymentModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePaymentSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد الدفع
          </button>
        </div>
      </Modal>
      {/* Session Modal */}
      <Modal
        isOpen={showSessionModal}
        title="إضافة جلسة"
        onClose={handleCloseSessionModal}
      >
        <div className="mb-3">
          <label className="form-label text-end w-100">عنوان الجلسة</label>
          <input
            type="text"
            className="form-control text-end"
            name="title"
            value={sessionData.title}
            onChange={handleSessionInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">تاريخ الجلسة</label>
          <input
            type="date"
            className="form-control text-end"
            name="date"
            value={sessionData.date}
            onChange={handleSessionInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">وصف الجلسة</label>
          <textarea
            className="form-control text-end"
            name="description"
            value={sessionData.description}
            onChange={handleSessionInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseSessionModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSessionSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد الإضافة
          </button>
        </div>
      </Modal>
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        title="تعديل القضية"
        onClose={handleCloseEditModal}
        modalSize={"modal-dialog modal-lg modal-dialog-scrollable"}
      >
        <div className="row">
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              رقم الدعوى القضائية
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="case_number"
              value={editData.case_number}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              اسم المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="opponent_name"
              value={editData.opponent_name}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              هاتف المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="opponent_phone"
              value={editData.opponent_phone}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              جنسية المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="opponent_nation"
              value={editData.opponent_nation}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              عنوان المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="opponent_address"
              value={editData.opponent_address}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              اسم محامي المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="opponent_lawyer"
              value={editData.opponent_lawyer}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              هاتف محامي المدعى عليه/الخصم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="lawyer_phone"
              value={editData.lawyer_phone}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              المحكمة المنظورة أمامها الدعوى
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="court_name"
              value={editData.court_name}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              اسم القاضي/الدائرة المنظورة أمامها الدعوى
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="judge_name"
              value={editData.judge_name}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">موضوع الدعوى</label>
            <input
              type="text"
              className="form-              control text-end"
              name="case_title"
              value={editData.case_title}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              أتعاب المحاماة (المتفق عليها)
            </label>
            <input
              type="number"
              className="form-control text-end"
              name="contract_price"
              value={editData.contract_price}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              ملاحظات/ملخص القضية
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="notes"
              value={editData.notes}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">اسم الموكل</label>
            <input
              type="text"
              className="form-control text-end"
              name="name"
              value={editData.name}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              البريد الإلكتروني الخاص بالموكل
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="email"
              value={editData.email}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              رقم الهوية/الإقامة الخاص بالموكل
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="ID_number"
              value={editData.ID_number}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              رقم الهاتف الخاص بالموكل
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="phone"
              value={editData.phone}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              عنوان إقامة الموكل
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="address"
              value={editData.address}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              جنسية الموكل/المقيم
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="nationality"
              value={editData.nationality}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              اسم الشركة (إن وجد)
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="company_name"
              value={editData.company_name}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">
              ملاحظات/بيانات إضافية عن الموكل
            </label>
            <input
              type="text"
              className="form-control text-end"
              name="notes"
              value={editData.notes}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">فئة الدعوى</label>
            <input
              type="text"
              className="form-control text-end"
              name="case_category"
              value={editData.case_category}
              onChange={handleEditInputChange}
              style={{
                fontSize: "1rem",
                padding: "10px",
                border: "1px solid #64b5f6", // لون حواف حقول الإدخال
                textAlign: "right",
              }}
            />
          </div>
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseEditModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد التعديل
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showAttachmentModal}
        title="إضافة مرفق"
        onClose={handleCloseAttachmentModal}
      >
        <div className="mb-3">
          <label className="form-label text-end w-100">عنوان المرفق</label>
          <input
            type="text"
            className="form-control text-end"
            name="title"
            value={attachmentData.title}
            onChange={handleAttachmentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">ملف المرفق</label>
          <input
            type="file"
            className="form-control text-end"
            name="file"
            onChange={handleAttachmentInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseAttachmentModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAttachmentSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد الإضافة
          </button>
        </div>
      </Modal>
      {/* Expenses Modal */}
      <Modal
        isOpen={showExpensesModal}
        title="مصروفات القضية"
        onClose={handleCloseExpensesModal}
        modalSize={"modal-dialog modal-dialog-scrollable"}
      >
        {caseExpenses && caseExpenses.length > 0 ? (
          <>
            <table
              className="table table-hover table-bordered"
              style={{ fontSize: "1.1rem", borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="text-center" style={{ lineHeight: "2.2rem" }}>
                  <th
                    className="text-end"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      border: "2px solid #64b5f6", // لون حواف الجدول
                      width: "8%",
                    }}
                  >
                    م
                  </th>
                  <th
                    className="text-end"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      border: "2px solid #64b5f6", // لون حواف الجدول
                      width: "35%",
                    }}
                  >
                    بيان المصروف
                  </th>
                  <th
                    className="text-end"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      border: "2px solid #64b5f6", // لون حواف الجدول
                      width: "25%",
                    }}
                  >
                    المبلغ المستحق
                  </th>
                  <th
                    className="text-end"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      border: "2px solid #64b5f6", // لون حواف الجدول
                      width: "20%",
                    }}
                  >
                    تاريخ الصرف
                  </th>
                  <th
                    className="text-end"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      border: "2px solid #64b5f6", // لون حواف الجدول
                      width: "12%",
                    }}
                  >
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {caseExpenses.map((expense, index) => (
                  <tr
                    key={index}
                    className="text-center"
                    style={{ lineHeight: "2.2rem" }}
                  >
                    <td
                      className="text-end"
                      style={{ padding: "10px", border: "2px solid #64b5f6" }} // لون حواف الجدول
                    >
                      {index + 1}
                    </td>
                    <td
                      className="text-end"
                      style={{ padding: "10px", border: "2px solid #64b5f6" }} // لون حواف الجدول
                    >
                      {expense.title}
                    </td>
                    <td
                      className="text-end"
                      style={{ padding: "10px", border: "2px solid #64b5f6" }} // لون حواف الجدول
                    >
                      {parseFloat(expense.amount).toFixed(2)} ج.م
                    </td>
                    <td
                      className="text-end"
                      style={{ padding: "10px", border: "2px solid #64b5f6" }} // لون حواف الجدول
                    >
                      {new Date(expense.date).toLocaleDateString("ar-EG")}
                    </td>
                    <td
                      className="text-end"
                      style={{ padding: "10px", border: "2px solid #64b5f6" }} // لون حواف الجدول
                    >
                      <button
                        className="btn btn-sm btn-outline-danger ms-1"
                        onClick={() =>
                          handleDeleteExpense(
                            expense.customer_id,
                            expense.case_id,
                            expense.id
                          )
                        }
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          handleOpenEditExpenseModal(
                            expense.customer_id,
                            expense.case_id,
                            expense
                          )
                        }
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-end mt-3 fw-bold">
              <span className="fw-bold">جملة المصروفات: </span>
              {parseFloat(totalExpenses).toFixed(2)} ج.م
            </p>
          </>
        ) : (
          <p className="text-center">لا توجد مصروفات لهذه القضية.</p>
        )}
      </Modal>
      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpenseModal}
        title="إضافة مصروف"
        onClose={handleCloseAddExpenseModal}
      >
        <div className="mb-3">
          <label className="form-label text-end w-100">عنوان المصروف</label>
          <input
            type="text"
            className="form-control text-end"
            name="title"
            value={addExpenseData.title}
            onChange={handleAddExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">تاريخ المصروف</label>
          <input
            type="date"
            className="form-control text-end"
            name="date"
            value={addExpenseData.date}
            onChange={handleAddExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">المبلغ</label>
          <input
            type="number"
            className="form-control text-end"
            name="amount"
            value={addExpenseData.amount}
            onChange={handleAddExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseAddExpenseModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddExpenseSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد الإضافة
          </button>
        </div>
      </Modal>
      {/* Edit Expense Modal */}
      <Modal
        isOpen={showEditExpenseModal}
        title="تعديل المصروف"
        onClose={handleCloseEditExpenseModal}
      >
        <div className="mb-3">
          <label className="form-label text-end w-100">عنوان المصروف</label>
          <input
            type="text"
            className="form-control text-end"
            name="title"
            value={editExpenseData.title}
            onChange={handleEditExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">تاريخ المصروف</label>
          <input
            type="date"
            className="form-control text-end"
            name="date"
            value={editExpenseData.date}
            onChange={handleEditExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">المبلغ</label>
          <input
            type="number"
            className="form-control text-end"
            name="amount"
            value={editExpenseData.amount}
            onChange={handleEditExpenseInputChange}
            style={{
              fontSize: "1rem",
              padding: "10px",
              border: "1px solid #64b5f6", // لون حواف حقول الإدخال
              textAlign: "right",
            }}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseEditExpenseModal}
            style={{ fontSize: "1.1rem" }}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditExpenseSubmit}
            style={{ fontSize: "1.1rem" }}
          >
            تأكيد التعديل
          </button>
        </div>
      </Modal>
      <div className="container ">
        <div className="row text-center">
          <div className="col-md-6 col-12 my-4">
            <Link
              to="/add-case"
              className="btn btn-dark px-5 py-2"
              style={{ backgroundColor: "#1a237e", color: "#fff" }}
            >
              <i className="fas fa-plus-circle me-2"></i> اضافه قضيه جديده
            </Link>
          </div>
          <div className="col-md-6 col-12 my-4">
            <Link
              to="/CaseTypes"
              className="btn btn-dark px-5 py-2"
              style={{ backgroundColor: "#1a237e", color: "#fff" }}
            >
              <i className="fas fa-folder-plus me-2"></i> اضافه نوع قضيه جديده
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cases;