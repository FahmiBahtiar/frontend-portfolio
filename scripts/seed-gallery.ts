import { galleryApi } from '@/lib/services/gallery';

const seedData = [
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    location: "Mt. Merbabu Summit",
    coordinates: "7°27'S 110°26'E",
    altitude: "3142M MSL",
    date: "2024-08-15",
    camera: "Sony A7III",
    heading: "045°"
  },
  {
    image: 'https://images.unsplash.com/photo-1623622863859-2931a6c3bc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtlciUyMG1vdW50YWluJTIwdHJhaWx8ZW58MXx8fHwxNzYxNjQxMzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    location: "Mt. Semeru Trail",
    coordinates: "8°06'S 112°55'E",
    altitude: "2800M MSL",
    date: "2024-07-22",
    camera: "Canon EOS R5",
    heading: "180°"
  },
  {
    image: 'https://images.unsplash.com/photo-1640119947640-c88936e3b8da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHN1bW1pdCUyMGdyZWVufGVufDF8fHx8MTc2MTY0MjIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    location: "Mt. Rinjani Peak",
    coordinates: "8°25'S 116°28'E",
    altitude: "3726M MSL",
    date: "2024-06-10",
    camera: "Sony A7III",
    heading: "270°"
  },
  {
    image: 'https://images.unsplash.com/photo-1671540225462-43b2eff8622f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGdyZWVufGVufDF8fHx8MTc2MTY0MjIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    location: "Mt. Bromo Valley",
    coordinates: "7°56'S 112°57'E",
    altitude: "2329M MSL",
    date: "2024-09-05",
    camera: "Nikon Z6II",
    heading: "090°"
  },
  {
    image: 'https://images.unsplash.com/photo-1630698515584-e419eaddc93c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHN1bW1pdHxlbnwxfHx8fDE3NjE2NDE4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    location: "Mt. Lawu Summit",
    coordinates: "7°37'S 111°11'E",
    altitude: "3265M MSL",
    date: "2024-05-18",
    camera: "Sony A7III",
    heading: "315°"
  },
];

async function seedGallery() {
  try {
    console.log('Seeding gallery data...');
    for (const photo of seedData) {
      await galleryApi.create(photo);
      console.log(`Created photo for ${photo.location}`);
    }
    console.log('Gallery seeding completed!');
  } catch (error) {
    console.error('Error seeding gallery:', error);
  }
}

seedGallery();