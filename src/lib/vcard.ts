import { ProfileData } from '@/types/profile';

export function generateVCard(profile: ProfileData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `NOTE:${profile.bio}`,
  ];
  
  if (profile.avatar) lines.push(`PHOTO;TYPE=JPEG;VALUE=URI:${profile.avatar}`);
  if (profile.social_links?.email) lines.push(`EMAIL:${profile.social_links.email}`);
  if (profile.social_links?.whatsapp) lines.push(`TEL:${profile.social_links.whatsapp}`);
  
  const profileUrl = `${window.location.origin}/u/${profile.slug}`;
  lines.push(`URL:${profileUrl}`);
  lines.push(`X-SOCIALPROFILE;type=LinkOne:${profileUrl}`);
  
  if (profile.social_links?.instagram) lines.push(`X-SOCIALPROFILE;type=instagram:${profile.social_links.instagram}`);
  if (profile.social_links?.linkedin) lines.push(`X-SOCIALPROFILE;type=linkedin:${profile.social_links.linkedin}`);
  if (profile.social_links?.twitter) lines.push(`X-SOCIALPROFILE;type=twitter:${profile.social_links.twitter}`);
  if (profile.social_links?.facebook) lines.push(`X-SOCIALPROFILE;type=facebook:${profile.social_links.facebook}`);
  if (profile.social_links?.github) lines.push(`X-SOCIALPROFILE;type=github:${profile.social_links.github}`);
  
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(profile: ProfileData) {
  const vcf = generateVCard(profile);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.slug || 'contact'}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
