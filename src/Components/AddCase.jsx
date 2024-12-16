import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AddCase = () => {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState({
    opponent_name: "",
    opponent_phone: "",
    opponent_address: "",
    case_category_id: "",
    ID_number: "",
    opponent_nation: "",
    opponent_lawyer: "",
    lawyer_phone: "",
    court_name: "",
    judge_name: "",
    case_number: "",
    case_title: "",
    contract_price: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [caseCategories, setCaseCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showErrorAlert("خطأ", "لم يتم العثور على التوكن. يرجى تسجيل الدخول.");
      navigate("/SignUp"); // توجيه المستخدم إلى صفحة تسجيل الدخول
      return null;
    }
    return token;
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "موافق",
      rtl: true,
    });
  };

  useEffect(() => {
    const fetchCaseCategories = async () => {
      const token = checkToken();
      if (!token) return;

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/case-categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCaseCategories(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/SignUp");
          return;
        }
        console.error("حدث خطأ أثناء جلب فئات القضايا:", error);
        showErrorAlert("خطأ", "حدث خطأ أثناء جلب فئات القضايا. حاول مرة أخرى.");
      }
    };

    fetchCaseCategories();
  }, [navigate]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = checkToken();
      if (!token) return;
      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/customers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomers(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/SignUp");
          return;
        }
        console.error("حدث خطأ أثناء جلب بيانات العملاء:", error);
        showErrorAlert(
          "خطأ",
          "حدث خطأ أثناء جلب بيانات العملاء. حاول مرة أخرى."
        );
      }
    };

    fetchCustomers();
  }, [navigate]);

  const handleAddCase = async () => {
    if (!selectedCustomerId) {
      showErrorAlert("خطأ", "يرجى اختيار العميل.");
      return;
    }

    if (!caseData.case_category_id) {
      Swal.fire({
        title: "خطأ",
        text: "برجاء ادخال نوع قضية أولاً.",
        icon: "error",
        confirmButtonText: "موافق",
        showCancelButton: true,
        cancelButtonText: "إضافة نوع قضية",
        reverseButtons: true,
        rtl: true,
      }).then((result) => {
        if (result.isDismissed) {
        }
      });
      return;
    }

    const token = checkToken();
    if (!token) return;

    const casePayload = {
      ...caseData,
      customer_id: selectedCustomerId,
    };

    try {
      setLoading(true);
      await axios.post(
        `https://law-office.al-mosa.com/api/customer/${selectedCustomerId}/store-case`,
        casePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        title: "نجاح",
        text: "تم إضافة القضية بنجاح.",
        icon: "success",
        confirmButtonText: "موافق",
        rtl: true,
      });
      setCaseData({
        opponent_name: "",
        opponent_phone: "",
        opponent_address: "",
        case_category_id: "",
        ID_number: "",
        opponent_nation: "",
        opponent_lawyer: "",
        lawyer_phone: "",
        court_name: "",
        judge_name: "",
        case_number: "",
        case_title: "",
        contract_price: "",
        notes: "",
      });
      setSelectedCustomerId(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/SignUp");
        return;
      }
      console.error("حدث خطأ أثناء إضافة القضية:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        let errorMessages = [];
        for (const key in errors) {
          errorMessages = errorMessages.concat(errors[key]);
        }
        const translatedErrorMessages = errorMessages.map((msg) => {
          switch (msg) {
            case "The opponent name field is required.":
              return "حقل اسم الخصم مطلوب.";
            case "The opponent phone field is required.":
              return "حقل هاتف الخصم مطلوب.";
            case "The opponent nation field is required.":
              return "حقل جنسية الخصم مطلوب.";
            case "The opponent lawyer field is required.":
              return "حقل محامي الخصم مطلوب.";
            case "The lawyer phone field is required.":
              return "حقل هاتف المحامي مطلوب.";
            case "The court name field is required.":
              return "حقل اسم المحكمة مطلوب.";
            case "The judge name field is required.":
              return "حقل اسم القاضي مطلوب.";
            case "The case number field is required.":
              return "حقل رقم القضية مطلوب.";
            case "The contract price field is required.":
              return "حقل مبلغ العقد مطلوب.";
            case "The ID number field is required.":
              return "حقل رقم الهوية مطلوب";
            default:
              return msg;
          }
        });

        Swal.fire({
          title: "خطأ في الإدخال",
          html: translatedErrorMessages
            .map((msg) => `<p style="text-align: right;">${msg}</p>`)
            .join(""),
          icon: "error",
          confirmButtonText: "موافق",
          rtl: true,
        });
      } else {
        showErrorAlert("خطأ", "حدث خطأ أثناء إضافة القضية. حاول مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-5" dir="rtl">
      <h1 className="text-center mb-4">إضافة قضية جديدة</h1>
      <div className="row">
        <div className="col-12 text-end">
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">اختار العميل</label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              disabled={loading}
            >
              <option value="">اختر العميل</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">اسم الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_name}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">هاتف الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_phone}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_phone: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">عنوان الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_address}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_address: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">نوع القضية</label>
            <select
              className="form-control"
              value={caseData.case_category_id}
              onChange={(e) =>
                setCaseData({ ...caseData, case_category_id: e.target.value })
              }
              disabled={loading}
            >
              <option value="">اختر نوع القضية</option>
              {caseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">رقم الهوية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.ID_number}
              onChange={(e) =>
                setCaseData({ ...caseData, ID_number: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">جنسية الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_nation}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_nation: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">محامي الخصم</label>
            <input
              type="text"
              className="form-control"
              value={caseData.opponent_lawyer}
              onChange={(e) =>
                setCaseData({ ...caseData, opponent_lawyer: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">هاتف المحامي</label>
            <input
              type="text"
              className="form-control"
              value={caseData.lawyer_phone}
              onChange={(e) =>
                setCaseData({ ...caseData, lawyer_phone: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">اسم المحكمة</label>
            <input
              type="text"
              className="form-control"
              value={caseData.court_name}
              onChange={(e) =>
                setCaseData({ ...caseData, court_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">اسم القاضي</label>
            <input
              type="text"
              className="form-control"
              value={caseData.judge_name}
              onChange={(e) =>
                setCaseData({ ...caseData, judge_name: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">رقم القضية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.case_number}
              onChange={(e) =>
                setCaseData({ ...caseData, case_number: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">عنوان القضية</label>
            <input
              type="text"
              className="form-control"
              value={caseData.case_title}
              onChange={(e) =>
                setCaseData({ ...caseData, case_title: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">مبلغ العقد</label>
            <input
              type="number"
              className="form-control"
              value={caseData.contract_price}
              onChange={(e) =>
                setCaseData({ ...caseData, contract_price: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group my-3">
            <label className="fs-3 fw-bold">ملاحظات</label>
            <textarea
              className="form-control"
              value={caseData.notes}
              onChange={(e) =>
                setCaseData({ ...caseData, notes: e.target.value })
              }
              disabled={loading}
            ></textarea>
          </div>
          <div className="form-group text-end my-3">
            <button
              className="btn btn-dark"
              onClick={handleAddCase}
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة القضية"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCase;
