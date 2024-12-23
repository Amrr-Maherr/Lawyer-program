// Importing necessary libraries and CSS files
import React from "react"; // React core library for building the UI.
import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router components for handling routing in the app.
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS for styling and layout utilities.
import "@fortawesome/fontawesome-free/css/all.min.css"; // Font Awesome icons CSS for using icons in the app.

import "./App.css"; // Custom CSS file for app-specific styles.

// Importing all the components used in the application
import NavBar from "./Components/NavBar"; // Navigation bar component displayed on most pages.
import Home from "./Components/Home"; // Home page component.
import Cases from "./Components/Cases"; // Cases list component.
import SingleCase from "./Components/SingleCase"; // Component to display details of a single case.
import AddCase from "./Components/AddCase"; // Component for adding a new case.
import Sessions from "./Components/Sessions"; // Sessions management component.
import Payments from "./Components/Payments"; // Payments management component.
import Attachments from "./Components/attachments"; // Component for handling attachments.
import LogIn from "./Components/LogIn"; // Log In page component.
import SignUp from "./Components/SignUp"; // Sign Up page component.
import Customers from "./Components/Customers"; // Customers list component.
import Expenses from "./Components/Expenses"; // Expenses management component.
import SystemSettings from "./Components/SystemSettings"; // System settings page component.
import CaseTypes from "./Components/CasesTypes"; // Component for managing case types.
import AddCustomer from "./Components/AddCustomer"; // Component for adding a new customer.
import ResetPassword from "./Components/ResetPassword"; // Password reset component.
import CustomerCategories from "./Components/CustomerCategories"; // Component for managing customer categories.
import PaymentReports from "./Components/PaymentReports"; // Reports for payments.
import ForgotPassword from "./Components/ForgotPassword"; // Forgot Password component.
import AddExpense from "./Components/AddExpense.jsx"; // Component for adding a new expense.
import AddExpenseCategory from "./Components/AddExpenseCategory.jsx"; // Component for adding expense categories.

function App() {
  return (
    // Wrapping the application in a Router to enable routing
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Define each route with its corresponding path and component(s) */}
          <Route
            path="/"
            element={
              <>
                <NavBar /> {/* Navigation bar */}
                <Home /> {/* Home page */}
              </>
            }
          />
          <Route
            path="cases"
            element={
              <>
                <NavBar />
                <Cases /> {/* Cases page */}
              </>
            }
          />
          <Route
            path="/case-details/:customerId/:caseId"
            element={
              <>
                <NavBar />
                <SingleCase /> {/* Case details page */}
              </>
            }
          />
          <Route
            path="/add-case"
            element={
              <>
                <NavBar />
                <AddCase /> {/* Add case page */}
              </>
            }
          />
          {/* Additional routes for other pages */}
          <Route
            path="sessions"
            element={
              <>
                <NavBar />
                <Sessions />
              </>
            }
          />
          <Route
            path="PaymentReports"
            element={
              <>
                <NavBar />
                <PaymentReports />
              </>
            }
          />
          <Route
            path="payments"
            element={
              <>
                <NavBar />
                <Payments />
              </>
            }
          />
          <Route
            path="Attachments"
            element={
              <>
                <NavBar />
                <Attachments />
              </>
            }
          />
          <Route
            path="/customers"
            element={
              <>
                <NavBar />
                <Customers />
              </>
            }
          />
          <Route
            path="/expenses"
            element={
              <>
                <NavBar />
                <Expenses />
              </>
            }
          />
          <Route
            path="/add-expense"
            element={
              <>
                <NavBar />
                <AddExpense />
              </>
            }
          />
          <Route
            path="/AddExpenseCategory"
            element={
              <>
                <NavBar />
                <AddExpenseCategory />
              </>
            }
          />
          <Route
            path="/system-settings"
            element={
              <>
                <NavBar />
                <SystemSettings />
              </>
            }
          />
          <Route path="/login" element={<LogIn />} /> {/* Login page */}
          <Route
            path="/CaseTypes"
            element={
              <>
                <NavBar />
                <CaseTypes /> {/* Manage case types */}
              </>
            }
          />
          <Route
            path="/ResetPassword"
            element={<ResetPassword />} {/* Password reset */}
          />
          <Route
            path="/AddCustomer"
            element={
              <>
                <NavBar />
                <AddCustomer /> {/* Add customer */}
              </>
            }
          />
          <Route path="/SignUp" element={<SignUp />} /> {/* Sign Up page */}
          <Route
            path="/ForgotPassword"
            element={<ForgotPassword />} {/* Forgot Password */}
          />
          <Route
            path="/customer-categories"
            element={
              <>
                <NavBar />
                <CustomerCategories /> {/* Manage customer categories */}
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; // Exporting the App component for use in the React app.
