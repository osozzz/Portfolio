import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

// Registro de licencias de audio (ADR-005, DOC-30 AFD-042): toda pista que se use debe estar aquí.
const audioLicenses = defineCollection({
  loader: file("content/audio/licenses.yaml"),
  schema: z
    .object({
      title: z.string().min(1),
      author: z.string().min(1),
      source_url: z.url(),
      license: z.enum(["CC0-1.0", "CC-BY-3.0", "CC-BY-4.0"]),
      file: z.string().min(1),
      retrieved: z.iso.date(),
      status: z.enum(["candidate", "shipped"]),
      attribution: z.string().optional(),
      notes: z.string().optional(),
    })
    // CC0 no exige crédito; cualquier otra licencia debe decir cómo atribuir (DOC-30).
    .refine((t) => t.license === "CC0-1.0" || Boolean(t.attribution), {
      message: "Las licencias CC-BY requieren el texto de atribución.",
      path: ["attribution"],
    }),
});

export const collections = { audioLicenses };
