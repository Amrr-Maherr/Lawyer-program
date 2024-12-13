import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Payments = () => {
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCases, setFilteredCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);

  // تعريف النمط الأساسي للمودال
  const modalStyle = {
    display: "block",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    zIndex: 1050,
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const filtered = cases.filter((caseItem) =>
        caseItem.customer_name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCases(filtered);
    } else {
      setFilteredCases(cases);
    }
  };

  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "يرجى تسجيل الدخول أولاً.",
          confirmButtonText: "حسنًا",
        });
        return;
      }
      Swal.fire({
        title: "جاري تحميل القضايا...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const response = await axios.get(
          `https://law-office.al-mosa.com/api/cases`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCases(response.data.cases);
        setFilteredCases(response.data.cases); // Initialize filtered cases
        Swal.close();
      } catch (error) {
        console.error("هناك خطأ أثناء جلب القضايا:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "حدث خطأ أثناء تحميل القضايا. يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسنًا",
        });
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (!selectedCase) return;

    const fetchPayments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "يرجى تسجيل الدخول أولاً.",
          confirmButtonText: "حسنًا",
        });
        return;
      }
      Swal.fire({
        title: "جاري تحميل المدفوعات...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const { customer_id, case_id } = selectedCase;

        const response = await axios.get(
          `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPayments(response.data.payments);
        Swal.close();
      } catch (error) {
        console.error("هناك خطأ أثناء جلب المدفوعات:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "حدث خطأ أثناء تحميل المدفوعات. يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسنًا",
        });
      }
    };

    fetchPayments();
  }, [selectedCase]);

  const handleCaseSelect = async (caseItem) => {
    setSelectedCase(caseItem);
    // قم بتعيين المدفوعات كمصفوفة فارغة مبدئيًا
    setPayments([]);
    // استدعي دالة جلب المدفوعات
    if (caseItem) {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "يرجى تسجيل الدخول أولاً.",
          confirmButtonText: "حسنًا",
        });
        return;
      }

      Swal.fire({
        title: "جاري تحميل المدفوعات...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const { customer_id, case_id } = caseItem;
        const response = await axios.get(
          `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const fetchedPayments = response.data.payments;
        setPayments(fetchedPayments);
        Swal.close();
        // إذا لم يكن هناك دفعات ، اعرض SweetAlert
        if (fetchedPayments.length === 0) {
          Swal.fire({
            icon: "info",
            title: "لا توجد مدفوعات",
            text: "هذه القضية لا تحتوي على أي مدفوعات مسجلة.",
            confirmButtonText: "حسنًا",
          });
        }
      } catch (error) {
        console.error("هناك خطأ أثناء جلب المدفوعات:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "حدث خطأ أثناء تحميل المدفوعات. يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسنًا",
        });
      }
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "يرجى تسجيل الدخول أولاً.",
        confirmButtonText: "حسنًا",
      });
      return;
    }

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل أنت متأكد من أنك تريد حذف هذه الدفعة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { customer_id, case_id } = selectedCase;
          await axios.delete(
            `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/payment/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setPayments(payments.filter((payment) => payment.id !== id));
          setFilteredCases(cases.filter((caseItem) => caseItem.id !== id));
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: `تم حذف الدفعة رقم ${id} بنجاح.`,
            confirmButtonText: "حسنًا",
          });
        } catch (error) {
          console.error("خطأ أثناء حذف الدفعة:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ!",
            text: "حدث خطأ أثناء حذف الدفعة. يرجى المحاولة مرة أخرى.",
            confirmButtonText: "حسنًا",
          });
        }
      }
    });
  };

  const handleEdit = async (payment) => {
    setEditPayment(payment);
    setOpenEditModal(true);
  };

  const handleOpenModal = async (payment) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "يرجى تسجيل الدخول أولاً.",
        confirmButtonText: "حسنًا",
      });
      return;
    }
    Swal.fire({
      title: "جاري تحميل تفاصيل الدفعة...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const { customer_id, case_id } = selectedCase;
      const response = await axios.get(
        `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/payment/${payment.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedPayment(response.data.payment);
      Swal.close();
      setOpenModal(true);
    } catch (error) {
      console.error("خطأ أثناء جلب تفاصيل الدفعة:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "حدث خطأ أثناء جلب تفاصيل الدفعة. يرجى المحاولة مرة أخرى.",
        confirmButtonText: "حسنًا",
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPayment(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditPayment(null);
  };

  const handleUpdatePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "يرجى تسجيل الدخول أولاً.",
        confirmButtonText: "حسنًا",
      });
      return;
    }

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل أنت متأكد من أنك تريد تعديل هذه الدفعة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، عدّل!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const title = document.getElementById("title").value;
          const amount = document.getElementById("amount").value;
          const date = document.getElementById("date").value;
          const method = document.getElementById("method").value;
          const updatedPayment = {
            title: title,
            amount: amount,
            date: date,
            method: method,
          };
          // Start of commented section
          // const remainingAmount = selectedPayment.case.contract_price - // Calculate remaining amount
          //                           payments.reduce((sum, payment) => sum + payment.amount, 0);
          // if(parseFloat(updatedPayment.amount) > remainingAmount){
          //     Swal.fire({
          //         icon: "error",
          //         title: "خطأ!",
          //         text: "المبلغ المدخل أكبر من المبلغ المتبقي للقضية.",
          //         confirmButtonText: "حسنًا",
          //       });
          //       return;
          // }
          // End of commented section
          const { customer_id, case_id } = selectedCase;
          await axios.post(
            `https://law-office.al-mosa.com/api/customer/${customer_id}/case/${case_id}/update-payment/${editPayment.id}`,
            updatedPayment,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const updatedPayments = payments.map((payment) => {
            if (payment.id === editPayment.id) {
              return { ...payment, ...updatedPayment };
            }
            return payment;
          });
          setPayments(updatedPayments);

          Swal.fire({
            icon: "success",
            title: "تم التعديل!",
            text: `تم تعديل الدفعة رقم ${editPayment.id} بنجاح.`,
            confirmButtonText: "حسنًا",
          });
          handleCloseEditModal();
        } catch (error) {
          console.error("خطأ أثناء تعديل الدفعة:", error);
          if (error.response && error.response.data) {
            Swal.fire({
              icon: "error",
              title: "خطأ!",
              text: error.response.data, // Display the error from the API
              confirmButtonText: "حسنًا",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "خطأ!",
              text: "حدث خطأ أثناء تعديل الدفعة. يرجى المحاولة مرة أخرى.",
              confirmButtonText: "حسنًا",
            });
          }
        }
      }
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-dark">تفاصيل المدفوعات</h2>
      <div className="mb-3 d-flex justify-content-end">
        <input
          type="text"
          className="form-control w-25"
          placeholder="ابحث باسم العميل"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ textAlign: "right", direction: "rtl" }}
        />
      </div>

      {cases.length === 0 && !selectedCase ? (
        <div className="text-center text-muted">
          يرجى الانتظار حتى يتم تحميل القضايا.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
          {filteredCases.map((caseItem) => (
            <div key={caseItem.case_id} className={`col`}>
              <div
                className={`card h-100 text-center shadow-sm case-card ${
                  selectedCase?.case_id === caseItem.case_id
                    ? "border-dark border-2"
                    : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleCaseSelect(caseItem)}
              >
                <div className="card-header bg-dark text-white">
                  {caseItem.case_number}
                </div>
                <div className="card-body">
                  <p className="card-text font-weight-bold">
                    {caseItem.customer_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {payments.length === 0 && selectedCase ? (
        <div className="text-center text-muted">
          يرجى الانتظار حتى يتم تحميل المدفوعات.
        </div>
      ) : payments.length === 0 && !selectedCase ? (
        <div className="text-center text-muted">
          يرجى اختيار قضية لعرض تفاصيل المدفوعات.
        </div>
      ) : payments.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th className="align-middle">الإجراءات</th>
                <th className="align-middle">طريقة الدفع</th>
                <th className="align-middle">تاريخ الدفع</th>
                <th className="align-middle">المبلغ المدفوع</th>
                <th className="align-middle">عنوان الدفعة</th>
                <th className="align-middle">#</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={index % 2 === 0 ? "table-light" : ""}
                >
                  <td className="align-middle">
                    <button
                      className="btn btn-danger btn-sm me-2 action-btn"
                      onClick={() => handleDelete(payment.id)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      className="btn btn-primary btn-sm me-2 action-btn"
                      onClick={() => handleEdit(payment)}
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-info btn-sm action-btn"
                      onClick={() => handleOpenModal(payment)}
                    >
                      <i className="fa fa-info-circle"></i>
                    </button>
                  </td>
                  <td className="align-middle">{payment.method}</td>
                  <td className="align-middle">
                    {new Date(payment.date).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="align-middle">{payment.amount}</td>
                  <td className="align-middle">{payment.title}</td>
                  <td className="align-middle">{index + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-danger">
          لا توجد مدفوعات لهذه القضية.
        </div>
      )}

      {/* Bootstrap Modal تفاصيل */}
      <div
        className={`modal fade ${openModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5
                className="modal-title"
                style={{ textAlign: "right", width: "100%" }}
              >
                تفاصيل الدفعة
              </h5>
            </div>
            <div className="modal-body" style={{ direction: "rtl" }}>
              {selectedPayment && (
                <div className="container">
                  <h5 className="text-center mb-3">بيانات الدفعة</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-right">العنوان</th>
                        <td className="text-right">{selectedPayment.title}</td>
                      </tr>
                      <tr>
                        <th className="text-right">المبلغ</th>
                        <td className="text-right">{selectedPayment.amount}</td>
                      </tr>
                      <tr>
                        <th className="text-right">التاريخ</th>
                        <td className="text-right">
                          {new Date(selectedPayment.date).toLocaleDateString(
                            "ar-EG"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">طريقة الدفع</th>
                        <td className="text-right">{selectedPayment.method}</td>
                      </tr>
                    </tbody>
                  </table>
                  <h5 className="text-center mb-3">بيانات القضية</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-right">رقم القضية</th>
                        <td className="text-right">
                          {selectedPayment.case.case_number}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">عنوان القضية</th>
                        <td className="text-right">
                          {selectedPayment.case.case_title}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">اسم الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.opponent_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">هاتف الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.opponent_phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">جنسية الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.opponent_nation}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">عنوان الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.opponent_address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">اسم محامي الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.opponent_lawyer}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">هاتف محامي الخصم</th>
                        <td className="text-right">
                          {selectedPayment.case.lawyer_phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">اسم المحكمة</th>
                        <td className="text-right">
                          {selectedPayment.case.court_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">اسم القاضي</th>
                        <td className="text-right">
                          {selectedPayment.case.judge_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">ملاحظات القضية</th>
                        <td className="text-right">
                          {selectedPayment.case.notes}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h5 className="text-center mb-3">بيانات العميل</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-right">اسم العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">ايميل العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">رقم هوية العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.ID_number}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">هاتف العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">عنوان العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.address}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">جنسية العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.nationality}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">اسم شركة العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.company_name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right">ملاحظات العميل</th>
                        <td className="text-right">
                          {selectedPayment.case.customer.notes}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
      {openModal && <div className="modal-backdrop fade show"></div>}

      {/* Bootstrap Modal تعديل */}
      <div
        className={`modal fade ${openEditModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5
                className="modal-title"
                style={{ textAlign: "right", width: "100%" }}
              >
                تعديل الدفعة
              </h5>
            </div>
            <div className="modal-body">
              {editPayment && (
                <form style={{ direction: "rtl" }}>
                  <div className="mb-3">
                    <label
                      htmlFor="title"
                      className="form-label"
                      style={{ textAlign: "right", width: "100%" }}
                    >
                      العنوان
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      defaultValue={editPayment.title}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="amount"
                      className="form-label"
                      style={{ textAlign: "right", width: "100%" }}
                    >
                      المبلغ
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      defaultValue={editPayment.amount}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="date"
                      className="form-label"
                      style={{ textAlign: "right", width: "100%" }}
                    >
                      التاريخ
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      defaultValue={
                        new Date(editPayment.date).toISOString().split("T")[0]
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="method"
                      className="form-label"
                      style={{ textAlign: "right", width: "100%" }}
                    >
                      طريقة الدفع
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="method"
                      defaultValue={editPayment.method}
                    />
                  </div>
                </form>
              )}
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
                onClick={handleUpdatePayment}
              >
                تحديث
              </button>
            </div>
          </div>
        </div>
      </div>
      {openEditModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Payments;
