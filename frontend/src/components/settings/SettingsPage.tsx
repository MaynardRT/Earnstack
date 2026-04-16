import React, { useEffect, useState } from "react";
import { settingsService } from "../../services/settingsService";
import { transactionService } from "../../services/transactionService";
import { ServiceFee, User } from "../../types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import { Download } from "lucide-react";
import { useAuthStore } from "../../context/authStore";
import { UserAvatar } from "../common/UserAvatar";

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"appearance" | "fees" | "users">(
    "appearance",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // User creation form state
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "Seller" as "Admin" | "Seller",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    if (activeTab === "fees") loadServiceFees();
    if (activeTab === "users" && user?.role === "Admin") loadUsers();
  }, [activeTab, user?.role]);

  const loadServiceFees = async () => {
    setLoading(true);
    try {
      const fees = await settingsService.getServiceFees();
      setServiceFees(fees);
    } catch (err) {
      setError("Failed to load service fees");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await settingsService.getUsers();
      setUsers(allUsers);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newUserForm.email ||
      !newUserForm.fullName ||
      !newUserForm.password ||
      !newUserForm.role
    ) {
      setError("Please fill in all fields");
      return;
    }

    setCreatingUser(true);
    try {
      await settingsService.createUser(
        newUserForm.email,
        newUserForm.fullName,
        newUserForm.password,
        newUserForm.role,
      );
      setSuccess("User created successfully!");
      setNewUserForm({ email: "", fullName: "", password: "", role: "Seller" });
      loadUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const blob = await transactionService.exportTransactions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      setSuccess("Transactions exported successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to export transactions");
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await settingsService.updateUser(userId, { isActive: !isActive });
      loadUsers();
      setSuccess("User status updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update user status");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file for your avatar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be 2MB or smaller.");
      return;
    }

    setIsUpdatingAvatar(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const updatedUser = await settingsService.updateProfile(
          reader.result as string,
        );
        updateUser(updatedUser);
        setSuccess("Avatar updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update avatar",
        );
      } finally {
        setIsUpdatingAvatar(false);
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setError("Failed to read avatar image.");
      setIsUpdatingAvatar(false);
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setIsUpdatingAvatar(true);
    setError(null);

    try {
      const updatedUser = await settingsService.updateProfile(null);
      updateUser(updatedUser);
      setSuccess("Avatar removed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "appearance"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab("fees")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "fees"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Service Fees
        </button>
        {user?.role === "Admin" && (
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            User Management
          </button>
        )}
      </div>

      {/* Appearance */}
      {activeTab === "appearance" && (
        <Card title="Appearance Settings">
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/80">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <UserAvatar
                  fullName={user?.fullName}
                  profilePicture={user?.profilePicture}
                  size="xl"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Avatar
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload a custom avatar to personalize your account across
                    the app.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG, or GIF. Max size: 2MB.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUpdatingAvatar}
                  />
                  {isUpdatingAvatar ? "Updating..." : "Upload Avatar"}
                </label>
                <Button
                  variant="secondary"
                  onClick={handleRemoveAvatar}
                  disabled={isUpdatingAvatar || !user?.profilePicture}
                >
                  Remove Avatar
                </Button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Theme mode is controlled by the theme toggle in the header.
            </p>
            <Button variant="secondary" fullWidth>
              Reset to Default
            </Button>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Data Export
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export all your transaction history as CSV for backup or
                analysis.
              </p>
              <Button variant="primary" onClick={handleExportTransactions}>
                <Download size={18} />
                Export Transactions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Service Fees */}
      {activeTab === "fees" && (
        <Card title="Service Fees Configuration">
          {loading ? (
            <div className="text-center py-8">Loading service fees...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Provider/Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Fee
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serviceFees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                      >
                        No service fees configured
                      </td>
                    </tr>
                  ) : (
                    serviceFees.map((fee) => (
                      <tr
                        key={fee.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {fee.serviceType}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {fee.providerType || fee.methodType || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {fee.feePercentage
                            ? `${fee.feePercentage}%`
                            : `₱${fee.flatFee?.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* User Management */}
      {activeTab === "users" && user?.role === "Admin" && (
        <>
          {/* Create User Form */}
          <Card title="Create New User" className="mb-6">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    disabled={creatingUser}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUserForm.fullName}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    disabled={creatingUser}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="Create a secure password"
                    disabled={creatingUser}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-role-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="user-role-select"
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        role: e.target.value as "Admin" | "Seller",
                      })
                    }
                    disabled={creatingUser}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={creatingUser}
              >
                Create User
              </Button>
            </form>
          </Card>

          {/* Users List */}
          <Card title="User Management">
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {u.fullName}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {u.email}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {u.role}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                u.isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                              }`}
                            >
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant={u.isActive ? "danger" : "success"}
                              size="sm"
                              onClick={() =>
                                handleToggleUserStatus(
                                  u.id,
                                  u.isActive ?? false,
                                )
                              }
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
