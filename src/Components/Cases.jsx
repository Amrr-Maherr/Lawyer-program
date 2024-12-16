import React, { useEffect, useState } from "react";
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
            <div className={`modal-dialog ${modalSize}`}>
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title text-end w-100">{title}</h5>
                    </div>
                    <div className="modal-body" dir="rtl">
                        {children}
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
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
      setCaseExpenses(response.expenses);
      setTotalExpenses(response.total_expenses);
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
          setCaseExpenses(response.expenses);
          setTotalExpenses(response.total_expenses);
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
      setCaseExpenses(response.expenses);
      setTotalExpenses(response.total_expenses);
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
    <div className="container-fluid">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 col-12 my-4 ">
            <input
              type="text"
              className="form-control w-100 w-md-50"
              placeholder="ابحث عن القضية"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="col-md-6 col-12 my-4  text-md-end text-center">
            <h2>بيانات القضايا</h2>
          </div>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-3 g-4 flex-row-reverse my-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div className="col" key={item.case_id}>
              <div className="card h-100 case-card case-card" dir="rtl">
                <div className="card-header case-card-header bg-dark text-white d-flex justify-content-between align-items-center">
                  <h5 className="card-title m-0 text-start flex-grow-1 ps-2">
                    {item.customer_name}
                  </h5>
                  <i className="fas fa-user fs-4 me-2"></i>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-borderless table-sm custom-table">
                      <tbody>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">
                              رقم الدعوى القضائية:
                            </span>
                            <i className="fas fa-file-invoice ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.case_number}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">فئة الدعوى:</span>
                            <i className="fas fa-tags ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.case_category}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">
                              أتعاب المحاماة (المتفق عليها):
                            </span>
                            <i className="fas fa-coins ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.contract_price}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">
                              رقم الهاتف الخاص بالموكل:
                            </span>
                            <i className="fas fa-phone ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.customer_phone}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">
                              المبالغ المسددة من الأتعاب:
                            </span>
                            <i className="fas fa-money-bill-wave ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.paid_amount}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="text-end align-middle">
                            <span className="text-bold me-2">
                              المبلغ المتبقي من الأتعاب:
                            </span>
                            <i className="fas fa-hand-holding-usd ms-3"></i>
                          </th>
                          <td className="text-start align-middle">
                            {item.remaining_amount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <hr className="" />
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    <button
                      className="btn btn-info btn-sm case-button"
                      onClick={() =>
                        handleDetails(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-info-circle ms-1"></i> تفاصيل
                    </button>
                    <button
                      className="btn btn-danger btn-sm case-button"
                      onClick={() =>
                        handleDelete(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-trash-alt ms-1"></i> حذف
                    </button>
                    <button
                      className="btn btn-success btn-sm case-button"
                      onClick={() =>
                        handleOpenPaymentModal(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-money-bill ms-1"></i> دفع
                    </button>
                    <button
                      className="btn btn-primary btn-sm case-button"
                      onClick={() =>
                        handleOpenSessionModal(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fa fa-plus ms-1"></i> جلسة
                    </button>
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
                    <button
                      className="btn btn-warning btn-sm case-button"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <i className="fa fa-edit ms-1"></i> تعديل
                    </button>
                    <button
                      className="btn btn-secondary btn-sm case-button"
                      onClick={() =>
                        handleViewExpenses(item.customer_id, item.case_id)
                      }
                    >
                      <i className="fas fa-coins ms-1"></i> المصاريف
                    </button>
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
                </div>
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
        title="تفاصيل القضية"
        onClose={handleCloseModal}
        modalSize={"modal-dialog modal-dialog-scrollable"}
      >
        {selectedCase && (
          <>
            <table className="table table-hover table-bordered">
              <tbody>
                <tr>
                  <th className="text-end">رقم الدعوى القضائية:</th>
                  <td className="text-end">{selectedCase.case.case_number}</td>
                </tr>
                <tr>
                  <th className="text-end">اسم المدعى عليه/الخصم:</th>
                  <td className="text-end">
                    {selectedCase.case.opponent_name}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">هاتف المدعى عليه/الخصم:</th>
                  <td className="text-end">
                    {selectedCase.case.opponent_phone}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">جنسية المدعى عليه/الخصم:</th>
                  <td className="text-end">
                    {selectedCase.case.opponent_nation}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">عنوان المدعى عليه/الخصم:</th>
                  <td className="text-end">
                    {selectedCase.case.opponent_address}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">اسم محامي المدعى عليه/الخصم:</th>
                  <td className="text-end">
                    {selectedCase.case.opponent_lawyer}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">هاتف محامي المدعى عليه/الخصم:</th>
                  <td className="text-end">{selectedCase.case.lawyer_phone}</td>
                </tr>
                <tr>
                  <th className="text-end">المحكمة المنظورة أمامها الدعوى:</th>
                  <td className="text-end">{selectedCase.case.court_name}</td>
                </tr>
                <tr>
                  <th className="text-end">
                    اسم القاضي/الدائرة المنظورة أمامها الدعوى:
                  </th>
                  <td className="text-end">{selectedCase.case.judge_name}</td>
                </tr>
                <tr>
                  <th className="text-end">موضوع الدعوى:</th>
                  <td className="text-end">{selectedCase.case.case_title}</td>
                </tr>
                <tr>
                  <th className="text-end">أتعاب المحاماة (المتفق عليها):</th>
                  <td className="text-end">
                    {selectedCase.case.contract_price}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">ملاحظات/ملخص القضية:</th>
                  <td className="text-end">{selectedCase.case.notes}</td>
                </tr>
                <tr>
                  <th className="text-end">المبالغ المسددة من الأتعاب:</th>
                  <td className="text-end">{selectedCase.paid_amount}</td>
                </tr>
                <tr>
                  <th className="text-end">المبلغ المتبقي من الأتعاب:</th>
                  <td className="text-end">{selectedCase.remaining_amount}</td>
                </tr>
              </tbody>
            </table>
            <h4>تفاصيل الموكل:</h4>
            <table className="table table-hover table-bordered">
              <tbody>
                <tr>
                  <th className="text-end">اسم الموكل:</th>
                  <td className="text-end">{selectedCase.customer.name}</td>
                </tr>
                <tr>
                  <th className="text-end">البريد الإلكتروني الخاص بالموكل:</th>
                  <td className="text-end">{selectedCase.customer.email}</td>
                </tr>
                <tr>
                  <th className="text-end">
                    رقم الهوية/الإقامة الخاص بالموكل:
                  </th>
                  <td className="text-end">
                    {selectedCase.customer.ID_number}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">رقم الهاتف الخاص بالموكل:</th>
                  <td className="text-end">{selectedCase.customer.phone}</td>
                </tr>
                <tr>
                  <th className="text-end">عنوان إقامة الموكل:</th>
                  <td className="text-end">{selectedCase.customer.address}</td>
                </tr>
                <tr>
                  <th className="text-end">جنسية الموكل/المقيم:</th>
                  <td className="text-end">
                    {selectedCase.customer.nationality}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">اسم الشركة (إن وجد):</th>
                  <td className="text-end">
                    {selectedCase.customer.company_name}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">ملاحظات/بيانات إضافية عن الموكل:</th>
                  <td className="text-end">{selectedCase.customer.notes}</td>
                </tr>
              </tbody>
            </table>
            <h4>تصنيف الدعوى:</h4>
            <table className="table table-hover table-bordered">
              <tbody>
                <tr>
                  <th className="text-end">فئة الدعوى:</th>
                  <td className="text-end">
                    {selectedCase.case_category.name}
                  </td>
                </tr>
              </tbody>
            </table>{" "}
          </>
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
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">طريقة الدفع</label>
          <select
            className="form-select text-end"
            name="method"
            value={paymentData.method}
            onChange={handlePaymentInputChange}
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
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePaymentSubmit}
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
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">وصف الجلسة</label>
          <textarea
            className="form-control text-end"
            name="description"
            value={sessionData.description}
            onChange={handleSessionInputChange}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseSessionModal}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSessionSubmit}
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
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label text-end w-100">موضوع الدعوى</label>
            <input
              type="text"
              className="form-control text-end"
              name="case_title"
              value={editData.case_title}
              onChange={handleEditInputChange}
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
            />
          </div>
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseEditModal}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditSubmit}
          >
            تأكيد التعديل
          </button>
        </div>
      </Modal>
      {/* Attachment Modal */}
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
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-end w-100">ملف المرفق</label>
          <input
            type="file"
            className="form-control text-end"
            name="file"
            onChange={handleAttachmentInputChange}
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseAttachmentModal}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAttachmentSubmit}
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
            <table className="table table-hover table-bordered">
              <thead>
                <tr className="text-center">
                  <th className="text-end">م</th>
                  <th className="text-end">بيان المصروف</th>
                  <th className="text-end">المبلغ المستحق</th>
                  <th className="text-end">تاريخ الصرف</th>
                  <th className="text-end">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {caseExpenses.map((expense, index) => (
                  <tr key={index} className="text-center">
                    <td className="text-end">{index + 1}</td>
                    <td className="text-end">{expense.title}</td>
                    <td className="text-end">
                      {parseFloat(expense.amount).toFixed(2)} ج.م
                    </td>
                    <td className="text-end">
                      {new Date(expense.date).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="text-end">
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
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseAddExpenseModal}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddExpenseSubmit}
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
          />
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseEditExpenseModal}
          >
            إغلاق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditExpenseSubmit}
          >
            تأكيد التعديل
          </button>
        </div>
      </Modal>
      <div className="container ">
        <div className="row text-center">
          <div className="col-md-6 col-12 my-4">
            <Link to="/add-case" className="btn btn-dark px-5 py-2">
              <i className="fas fa-plus-circle me-2"></i> اضافه قضيه جديده
            </Link>
          </div>
          <div className="col-md-6 col-12 my-4">
            <Link to="/CaseTypes" className="btn btn-dark px-5 py-2">
              <i className="fas fa-folder-plus me-2"></i> اضافه نوع قضيه جديده
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cases;