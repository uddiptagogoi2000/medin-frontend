import { UserRound } from "lucide-react";

function AboutSection({ profile }: any) {
  const tags = [
    profile.basic?.specialization || "Interventional",
    "Echocardiography",
    "Heart Failure",
    "Pacing",
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <div className="mb-3 flex items-center gap-2">
        <UserRound size={16} className="text-primary" />
        <h2 className="font-semibold text-gray-900">Professional Summary</h2>
      </div>

      <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
        {profile.basic?.about ||
          "Senior specialist focused on evidence-based clinical practice, education, and collaborative patient care across complex cases."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#d8f1ef] px-2.5 py-1 text-xs font-medium text-[#2c6b67]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AboutSection;
