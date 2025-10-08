// src/types/candidate.ts

export interface WorkExperienceInput {
  companyName: string;
  title: string;
  fromDate: string;
  endDate?: string;
  country?: string;
  responsibilities?: string;
}

export interface EducationInput {
  institute: string;
  degree?: string;
  major?: string;
  fromDate?: string;
  endDate?: string;
  country?: string;
}

export interface LanguageSkillInput {
  language: string;
  speaking?: string;
  reading?: string;
  writing?: string;
}

export interface TravelMobilityInput {
  willingToRelocate?: string;
  availabilityForTravel?: string;
}

export interface DocumentInput {
  fileName: string;
  fileUrl?: string;
  fileType?: string;
}

export interface CandidateInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  candidateId?: string;
  title?: string;
  company?: string;
  email: string;
  phone?: string;
   skills?: string[];
  moreInfo?: string;

  workExperience?: WorkExperienceInput[];
  education?: EducationInput[];
  languageSkills?: LanguageSkillInput[];
  travelMobility?: TravelMobilityInput[];
  documents?: DocumentInput[];
}
