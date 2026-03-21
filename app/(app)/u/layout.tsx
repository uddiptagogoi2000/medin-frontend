const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      {children}
    </div>
  );
};

export default ProfileLayout;
