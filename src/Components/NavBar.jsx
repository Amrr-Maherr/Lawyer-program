import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/gavel-svgrepo-com.svg";
import Swal from "sweetalert2";

function NavBar() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const savedUsername = JSON.parse(localStorage.getItem("user"));
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://law-office.al-mosa.com/api/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        localStorage.clear();
        setUsername(null);

        Swal.fire({
          title: "تم تسجيل الخروج!",
          text: "تمت عملية تسجيل الخروج بنجاح.",
          icon: "success",
          confirmButtonText: "موافق",
        }).then(() => {
          navigate("/SignUp");
        });
      } else {
        Swal.fire({
          title: "حدث خطأ",
          text: "لم تتم عملية تسجيل الخروج بنجاح.",
          icon: "error",
          confirmButtonText: "موافق",
        });
      }
    } catch (error) {
      console.error("Logout error: ", error);
      Swal.fire({
        title: "حدث خطأ",
        text: "لم تتمكن من الاتصال بالخادم. يرجى المحاولة لاحقًا.",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

    const navItems = [
        {
            name: "الصفحة الرئيسية",
            link: "/",
            icon: "fas fa-home",
        },
        {
            name: "العملاء",
            link: "/customers",
            icon: "fas fa-users",
            subItems: [
                {
                    name: "أنواع العملاء",
                    link: "/customer-categories",
                    icon: "fas fa-users-cog",
                },
                {
                    name: "إضافة عميل",
                    link: "/AddCustomer",
                    icon: "fas fa-user-plus",
                },
            ],
        },
        {
            name: "القضايا",
            link: "/cases",
            icon: "fas fa-gavel",
            subItems: [
                {
                    name: "أنواع القضايا",
                    link: "/CaseTypes",
                    icon: "fas fa-balance-scale",
                },
                {
                    name: "إضافة قضية",
                    link: "/add-case",
                    icon: "fas fa-plus-circle",
                },
            ],
        },
        {
            name: "الجلسات",
            link: "/sessions",
            icon: "fas fa-calendar-alt",
        },
        {
            name: "المدفوعات",
            link: "/payments",
            icon: "fas fa-credit-card",
            subItems: [
                {
                    name: "تقارير المدفوعات",
                    link: "/PaymentReports",
                    icon: "fas fa-file-alt",
                },
            ],
        },
        {
            name: "الصور والملفات",
            link: "/Attachments",
            icon: "fas fa-image",
        },
        {
            name: "المصروفات",
            link: "/expenses",
            icon: "fas fa-wallet",
            subItems: [
                {
                    name: "إضافة مصروف",
                    link: "/add-expense",
                    icon: "fas fa-plus",
                },
                {
                  name: "إضافة تصنيف مصاريف",
                    link: "/AddExpenseCategory",
                  icon: "fas fa-plus",
              }
            ],
        },
    ];
    const authItems = [
        {
          name: "تسجيل الخروج",
          action: handleLogout,
          icon: "fas fa-sign-out-alt",
        },
        {
          name: "تسجيل الدخول",
          link: "/login",
          icon: "fas fa-sign-in-alt",
        },
        {
          name: "إنشاء حساب",
          link: "/signup",
          icon: "fas fa-user-plus",
        },
    ];


  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" className="logo-img me-2" />
          </Link>
          <button
            className="btn btn-outline-secondary ms-2"
            type="button"
            onClick={toggleFullScreen}
          >
            <i className="fas fa-expand"></i>
          </button>

          {username && (
            <span className="navbar-text ms-auto text-dark fw-bold">
              مرحبًا، {username.name.toUpperCase()}
            </span>
          )}

          <button
            className="btn btn-outline-secondary ms-auto"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasSidebar"
            aria-controls="offcanvasSidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end sidebar"
        tabIndex="-1"
        id="offcanvasSidebar"
        aria-labelledby="offcanvasSidebarLabel"
        style={{ width: "300px" }}
      >
        <div className="offcanvas-body">
          <ul className="nav flex-column text-end">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item sidebar-item">
                {item.link ? (
                  <Link
                    to={item.link}
                    className="nav-link d-flex justify-content-between align-items-center text-dark fw-bold sidebar-link"
                  >
                    <i className={`${item.icon} me-2 fs-5`}></i>
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <span className="nav-link d-flex justify-content-between align-items-center text-dark fw-bold sidebar-link">
                    <i className={`${item.icon} me-2 fs-5`}></i>
                    <span>{item.name}</span>
                  </span>
                )}

                {item.subItems && (
                  <ul className="nav flex-column ms-3 sidebar-sublist">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex} className="nav-item sidebar-subitem">
                        <Link
                          to={subItem.link}
                          className="nav-link d-flex justify-content-between align-items-center text-dark fw-bold sidebar-sublink"
                        >
                          <i className={`${subItem.icon} me-2 fs-6`}></i>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {token ? (
              <li className="nav-item sidebar-item">
                <button
                  className="nav-link d-flex justify-content-between align-items-center text-dark fw-bold sidebar-button"
                  onClick={authItems[0].action}
                >
                  <i className={`${authItems[0].icon} me-2 fs-5`}></i>
                  <span>{authItems[0].name}</span>
                </button>
              </li>
            ) : (
              authItems.slice(1).map((item, index) => (
                <li key={index} className="nav-item sidebar-item">
                  <Link
                    to={item.link}
                    className="nav-link d-flex justify-content-between align-items-center text-dark fw-bold sidebar-link"
                  >
                    <i className={`${item.icon} me-2 fs-5`}></i>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default NavBar;