import { Briefcase, Building2 } from "lucide-react";

function ExperienceSection({ profile }: any) {
  const experiences =
    profile.experiences?.length > 0
      ? profile.experiences
      : [
          {
            id: "dummy-1",
            title: "Head of Interventional Cardiology",
            hospital: profile.basic?.hospital || "AIMS Heart Center",
            start_year: 2018,
            end_year: "Present",
            description:
              "Overseeing complex coronary interventions and leading collaborative cardiac programs.",
          },
          {
            id: "dummy-2",
            title: "Senior Resident Doctor",
            hospital: "Fortis Escorts Heart Institute",
            start_year: 2014,
            end_year: 2018,
            description:
              "Specialized in pediatric cardiology and structural heart disease interventions.",
          },
        ];

  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <div className="mb-5 flex items-center gap-2">
        <Briefcase size={16} className="text-primary" />
        <h2 className="font-semibold text-gray-900">Clinical Experience</h2>
      </div>

      <div className="space-y-5">
        {experiences.map((exp: any) => (
          <div key={exp.id} className="flex gap-3">
            <div className="mt-1 rounded-md bg-default-100 p-2 h-fit">
              <Building2 size={14} className="text-gray-500" />
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-900">{exp.title}</h3>
              <p className="text-xs text-gray-500">
                {exp.hospital} · {exp.start_year || 2018} - {exp.end_year || "Present"}
              </p>
              <p className="mt-1 text-xs text-gray-600 leading-6">
                {exp.description || "Clinical leadership and multidisciplinary patient care."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExperienceSection;
