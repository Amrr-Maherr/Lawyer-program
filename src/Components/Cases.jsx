import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Cases = () => {
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
    file: null,
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
    opponent_address: "",
    court_name: "",
    judge_name: "",
    contract_price: "",
    case_category: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    nationality: "",
    customerId: null,
    caseId: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      Swal.fire({
        title: "جاري تحميل بيانات القضايا",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(response.data.cases);
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

    fetchData();
  }, []);

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
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedCase(response.data);
      setShowModal(true);
      Swal.close();
    } catch (error) {
      console.error("Error fetching case details:", error);
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
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");

        axios
          .delete(
            `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            setData(data.filter((item) => item.case_id !== caseId));
            Swal.fire("تم حذف القضية بنجاح!", "", "success");
          })
          .catch((error) => {
            console.error("Error deleting case:", error);
            Swal.fire(
              "حدث خطأ!",
              "لم يتم حذف القضية بنجاح، يرجى المحاولة مرة أخرى.",
              "error"
            );
          });
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
    setPaymentData({
      ...paymentData,
      customerId: customerId,
      caseId: caseId,
    });
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
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const handlePaymentSubmit = async () => {
    const token = localStorage.getItem("token");
    const { customerId, caseId, title, date, amount, method } = paymentData;

    try {
      const response = await axios.post(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-payment`,
        {
          title,
          date,
          amount,
          method,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status >= 200 && response.status < 300) {
        Swal.fire("تمت عملية الدفع بنجاح!", "", "success");

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
      } else {
        Swal.fire(
          "خطأ!",
          "لم تتم عملية الدفع بنجاح، يرجى المحاولة مرة أخرى.",
          "error"
        );
      }
      handleClosePaymentModal();
    } catch (error) {
      console.error("Error submitting payment:", error);
      Swal.fire(
        "خطأ!",
        "لم تتم عملية الدفع بنجاح، يرجى المحاولة مرة أخرى.",
        "error"
      );
    }
  };

  const handleOpenSessionModal = (customerId, caseId) => {
    setSessionData({
      ...sessionData,
      customerId: customerId,
      caseId: caseId,
    });
    setShowSessionModal(true);
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    setSessionData({
      title: "",
      file: null,
      date: "",
      description: "",
      customerId: null,
      caseId: null,
    });
  };
  const handleOpenEditModal = (item) => {
    setEditData({
      case_number: item.case_number,
      opponent_name: item.opponent_name,
      opponent_phone: item.opponent_phone,
      opponent_address: item.opponent_address,
      court_name: item.court_name,
      judge_name: item.judge_name,
      contract_price: item.contract_price,
      case_category: item.case_category,
      name: item.customer_name,
      email: item.customer_email,
      phone: item.customer_phone,
      address: item.customer_address,
      nationality: item.customer_nationality,
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
      opponent_address: "",
      court_name: "",
      judge_name: "",
      contract_price: "",
      case_category: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      nationality: "",
      customerId: null,
      caseId: null,
    });
    setSelectedCase(null);
  };

  const handleSessionInputChange = (e) => {
    const { name, type } = e.target;
    let value = type === "file" ? e.target.files[0] : e.target.value;
    setSessionData({
      ...sessionData,
      [name]: value,
    });
  };

  const handleSessionSubmit = async () => {
    const token = localStorage.getItem("token");
    const { customerId, caseId, title, file, date, description } = sessionData;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("date", date);
    formData.append("description", description);

    try {
      const response = await axios.post(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/store-session`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data); // **اضف هذا السطر**

      if (response.status >= 200 && response.status < 300) {
        Swal.fire("تمت إضافة الجلسة بنجاح!", "", "success");
      } else {
        Swal.fire(
          "خطأ!",
          "لم يتم إضافة الجلسة بنجاح، يرجى المحاولة مرة أخرى.",
          "error"
        );
      }
      handleCloseSessionModal();
    } catch (error) {
      console.error("Error submitting session:", error);
      Swal.fire(
        "خطأ!",
        "لم يتم إضافة الجلسة بنجاح، يرجى المحاولة مرة أخرى.",
        "error"
      );
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const {
      customerId,
      caseId,
      case_number,
      opponent_name,
      opponent_phone,
      opponent_address,
      court_name,
      judge_name,
      contract_price,
      case_category,
      name,
      email,
      phone,
      address,
      nationality,
    } = editData;
    try {
      const response = await axios.post(
        `https://law-office.al-mosa.com/api/customer/${customerId}/update-case/${caseId}`,
        {
          case_number,
          opponent_name,
          opponent_phone,
          opponent_address,
          court_name,
          judge_name,
          contract_price,
          case_category,
          name,
          email,
          phone,
          address,
          nationality,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Swal.fire("تم تعديل بيانات القضية بنجاح!", "", "success");
        setData((prevData) => {
          return prevData.map((item) => {
            if (item.customer_id === customerId && item.case_id === caseId) {
              return {
                ...item,
                case_number: case_number,
                opponent_name: opponent_name,
                opponent_phone: opponent_phone,
                opponent_address: opponent_address,
                court_name: court_name,
                judge_name: judge_name,
                contract_price: contract_price,
                case_category: case_category,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                customer_address: address,
                customer_nationality: nationality,
              };
            }
            return item;
          });
        });
      } else {
        Swal.fire(
          "خطأ!",
          "لم يتم تعديل بيانات القضية بنجاح، يرجى المحاولة مرة أخرى.",
          "error"
        );
      }
      handleCloseEditModal();
    } catch (error) {
      console.error("Error submitting edit:", error);
      Swal.fire(
        "خطأ!",
        "لم يتم تعديل بيانات القضية بنجاح، يرجى المحاولة مرة أخرى.",
        "error"
      );
    }
  };

  if (loading) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid my-5">
      <div className="container my-4">
        <div className="row align-items-center">
          <div className="col-md-6 col-12 my-3">
            <input
              type="text"
              className="form-control w-100 w-md-50"
              placeholder="ابحث عن القضية"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="col-md-6 col-12 my-3 text-md-end text-center">
            <h2>بيانات القضايا</h2>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>الإجراءات</th>
                  <th>السعر الإجمالي</th>
                  <th>المبلغ المتبقي</th>
                  <th>المبلغ المدفوع</th>
                  <th>فئة القضية</th>
                  <th>فئة العميل</th>
                  <th>رقم القضية</th>
                  <th>اسم العميل</th>
                  <th>رقم الهاتف</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.case_id}>
                      <td>
                        <div className="d-flex flex-wrap justify-content-end gap-2">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleDetails(item.customer_id, item.case_id)
                            }
                          >
                            <i className="fa fa-info-circle"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(item.customer_id, item.case_id)
                            }
                          >
                            <i className="fa fa-trash-alt"></i>
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleOpenPaymentModal(
                                item.customer_id,
                                item.case_id
                              )
                            }
                          >
                            <i className="fa fa-money-bill"></i>
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              handleOpenSessionModal(
                                item.customer_id,
                                item.case_id
                              )
                            }
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                        </div>
                      </td>
                      <td>{item.contract_price}</td>
                      <td>{item.remaining_amount}</td>
                      <td>{item.paid_amount}</td>
                      <td>{item.case_category}</td>
                      <td>{item.customer_category}</td>
                      <td>{item.case_number}</td>
                      <td>{item.customer_name}</td>
                      <td>{item.customer_phone}</td>
                      <td>{index + 1}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      {searchTerm
                        ? "لا توجد نتائج تطابق بحثك."
                        : "لا توجد قضايا حالياً."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="caseDetailsModal"
        aria-hidden={!showModal}
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">تفاصيل القضية</h5>
            </div>
            <div className="modal-body" dir="rtl">
              {selectedCase && (
                <>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">رقم القضية:</th>
                        <td className="text-end">
                          {selectedCase.case.case_number}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">اسم المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">هاتف المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">عنوان المدعى عليه:</th>
                        <td className="text-end">
                          {selectedCase.case.opponent_address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">محكمة القضية:</th>
                        <td className="text-end">
                          {selectedCase.case.court_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">اسم القاضي:</th>
                        <td className="text-end">
                          {selectedCase.case.judge_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">المبلغ المدفوع:</th>
                        <td className="text-end">{selectedCase.paid_amount}</td>
                      </tr>
                      <tr>
                        <th className="text-end">المبلغ المتبقي:</th>
                        <td className="text-end">
                          {selectedCase.remaining_amount}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">السعر الإجمالي:</th>
                        <td className="text-end">
                          {selectedCase.case.contract_price}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>تفاصيل العميل:</h4>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">اسم العميل:</th>
                        <td className="text-end">
                          {selectedCase.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">البريد الإلكتروني:</th>
                        <td className="text-end">
                          {selectedCase.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">رقم الهاتف:</th>
                        <td className="text-end">
                          {selectedCase.customer.phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">العنوان:</th>
                        <td className="text-end">
                          {selectedCase.customer.address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-end">الجنسية:</th>
                        <td className="text-end">
                          {selectedCase.customer.nationality}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>فئة القضية:</h4>
                  <table className="table table-hover table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">الفئة:</th>
                        <td className="text-end">
                          {selectedCase.case.case_category}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${showPaymentModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="paymentModal"
        aria-hidden={!showPaymentModal}
        style={{ display: showPaymentModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">إضافة دفعة</h5>
            </div>
            <div className="modal-body" dir="rtl">
              <div className="mb-3">
                <label className="form-label text-end w-100">
                  عنوان الدفعة
                </label>
                <input
                  type="text"
                  className="form-control text-end"
                  name="title"
                  value={paymentData.title}
                  onChange={handlePaymentInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-end w-100">
                  تاريخ الدفعة
                </label>
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
            </div>
            <div className="modal-footer">
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
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${showSessionModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="sessionModal"
        aria-hidden={!showSessionModal}
        style={{ display: showSessionModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">إضافة جلسة</h5>
            </div>
            <div className="modal-body" dir="rtl">
              <div className="mb-3">
                <label className="form-label text-end w-100">
                  عنوان الجلسة
                </label>
                <input
                  type="text"
                  className="form-control text-end"
                  name="title"
                  value={sessionData.title}
                  onChange={handleSessionInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-end w-100">ملف الجلسة</label>
                <input
                  type="file"
                  className="form-control text-end"
                  name="file"
                  onChange={handleSessionInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-end w-100">
                  تاريخ الجلسة
                </label>
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
            </div>
            <div className="modal-footer">
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
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${showEditModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="editModal"
        aria-hidden={!showEditModal}
        style={{ display: showEditModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">تعديل القضية</h5>
            </div>
            <div className="modal-body" dir="rtl">
              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label text-end w-100">
                    رقم القضية
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
                    اسم المدعى عليه
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
                    هاتف المدعى عليه
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
                    عنوان المدعى عليه
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
                    محكمة القضية
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
                    اسم القاضي
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
                  <label className="form-label text-end w-100">
                    السعر الاجمالي
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
                    فئة القضية
                  </label>
                  <input
                    type="text"
                    className="form-control text-end"
                    name="case_category"
                    value={editData.case_category}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label text-end w-100">
                    اسم العميل
                  </label>
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
                    البريد الالكتروني
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
                    رقم الهاتف
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
                  <label className="form-label text-end w-100">العنوان</label>
                  <input
                    type="text"
                    className="form-control text-end"
                    name="address"
                    value={editData.address}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label text-end w-100">الجنسية</label>
                  <input
                    type="text"
                    className="form-control text-end"
                    name="nationality"
                    value={editData.nationality}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
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
          </div>
        </div>
      </div>
      <div className="container my-4">
        <div className="row text-center">
          <div className="col-md-6 col-12 my-3">
            <Link to="/add-case" className="btn btn-dark px-5 py-2">
              <i className="fas fa-plus-circle me-2"></i> اضافه قضيه جديده
            </Link>
          </div>
          <div className="col-md-6 col-12 my-3">
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