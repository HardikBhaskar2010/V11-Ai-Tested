import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// =============================
// 🔧 COMPONENTS MANAGEMENT
// =============================

// Sample components data
const SAMPLE_COMPONENTS = [
  {
    name: "Arduino Uno",
    category: "Microcontrollers",
    description: "Popular microcontroller board based on ATmega328P",
    price: 450.0,
    availability: "Available",
    stock: 15
  },
  {
    name: "Servo Motor SG90",
    category: "Motors",
    description: "Micro servo motor for robotics projects",
    price: 150.0,
    availability: "Available",
    stock: 8
  },
  {
    name: "Ultrasonic Sensor HC-SR04",
    category: "Sensors", 
    description: "Distance measuring sensor using ultrasonic waves",
    price: 120.0,
    availability: "Available",
    stock: 12
  },
  {
    name: "LED Strip WS2812B",
    category: "Display",
    description: "Addressable RGB LED strip", 
    price: 300.0,
    availability: "Available",
    stock: 6
  },
  {
    name: "ESP32 DevKit",
    category: "Microcontrollers",
    description: "WiFi and Bluetooth enabled microcontroller",
    price: 550.0,
    availability: "Available",
    stock: 10
  },
  {
    name: "PIR Motion Sensor",
    category: "Sensors",
    description: "Passive infrared sensor for motion detection",
    price: 80.0,
    availability: "Available",
    stock: 15
  },
  {
    name: "LCD Display 16x2",
    category: "Display",
    description: "Character display for showing text and numbers",
    price: 200.0,
    availability: "Available",
    stock: 8
  },
  {
    name: "Breadboard 830 Points",
    category: "Prototyping",
    description: "Half-size breadboard for circuit prototyping",
    price: 100.0,
    availability: "Available",
    stock: 20
  }
];

// Initialize sample components if collection is empty
export async function initializeSampleComponents() {
  try {
    const snap = await getDocs(collection(db, "components"));
    
    if (snap.empty) {
      console.log("🔧 Initializing sample components...");
      
      const batch = [];
      for (const component of SAMPLE_COMPONENTS) {
        const componentWithTimestamp = {
          ...component,
          createdAt: serverTimestamp(),
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        batch.push(addDoc(collection(db, "components"), componentWithTimestamp));
      }
      
      await Promise.all(batch);
      console.log(`✅ Added ${SAMPLE_COMPONENTS.length} sample components`);
    }
  } catch (error) {
    console.warn("⚠️ Could not initialize sample components:", error);
    // Return sample components as fallback
    return SAMPLE_COMPONENTS;
  }
}

// Get all components
export async function fetchComponents() {
  try {
    console.log("🔥 Attempting to fetch components from Firebase...");
    
    // Try to fetch from Firebase first
    const snap = await getDocs(collection(db, "components"));
    console.log(`📊 Found ${snap.size} components in Firebase`);
    
    if (snap.empty) {
      console.log("📝 No components in Firebase, initializing sample components...");
      await initializeSampleComponents();
      
      // Fetch again after initialization
      const newSnap = await getDocs(collection(db, "components"));
      const components = newSnap.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log(`✅ Initialized and fetched ${components.length} components from Firebase`);
      return components;
    }
    
    const components = snap.docs.map((doc) => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    console.log(`✅ Successfully fetched ${components.length} components from Firebase`);
    return components;
    
  } catch (error) {
    console.error("❌ Error fetching from Firebase:", error);
    console.log("🔄 Falling back to sample components");
    
    // Return sample components as fallback
    return SAMPLE_COMPONENTS.map((comp, index) => ({
      ...comp,
      id: `comp_${index + 1}`,
      source: "fallback"
    }));
  }
}

// Get component by ID
export async function fetchComponentById(id) {
  try {
    const ref = doc(db, "components", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Component not found");
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error("Error fetching component:", error);
    throw error;
  }
}

// Add component
export async function addComponent(component) {
  try {
    const componentWithTimestamp = {
      ...component,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "components"), componentWithTimestamp);
    return { id: docRef.id, ...componentWithTimestamp };
  } catch (error) {
    console.error("Error adding component:", error);
    throw error;
  }
}

// Update component
export async function updateComponent(id, updates) {
  try {
    const ref = doc(db, "components", id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(ref, updateData);
    return { id, ...updates };
  } catch (error) {
    console.error("Error updating component:", error);
    throw error;
  }
}

// Delete component
export async function deleteComponent(id) {
  try {
    const ref = doc(db, "components", id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error("Error deleting component:", error);
    throw error;
  }
}

// Get components by category
export async function fetchComponentsByCategory(category) {
  try {
    const q = query(collection(db, "components"), where("category", "==", category));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching components by category:", error);
    throw error;
  }
}

// =============================
// 🎯 IDEAS MANAGEMENT
// =============================

// Get all saved ideas
export async function fetchIdeas() {
  try {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return []; // Return empty array as fallback
  }
}

// Save a new idea
export async function saveIdea(idea) {
  try {
    const ideaWithTimestamp = {
      ...idea,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "ideas"), ideaWithTimestamp);
    return { id: docRef.id, ...ideaWithTimestamp };
  } catch (error) {
    console.error("Error saving idea:", error);
    throw error;
  }
}

// Update an existing idea
export async function updateIdea(id, updates) {
  try {
    const ref = doc(db, "ideas", id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(ref, updateData);
    return { id, ...updates };
  } catch (error) {
    console.error("Error updating idea:", error);
    throw error;
  }
}

// Delete idea
export async function deleteIdea(id) {
  try {
    const ref = doc(db, "ideas", id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error("Error deleting idea:", error);
    throw error;
  }
}

// Toggle favorite status
export async function toggleIdeaFavorite(id, isFavorite) {
  try {
    const ref = doc(db, "ideas", id);
    await updateDoc(ref, { 
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: `Idea ${isFavorite ? 'added to' : 'removed from'} favorites` };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

// Search ideas
export async function searchIdeas(searchTerm) {
  try {
    const snap = await getDocs(collection(db, "ideas"));
    const allIdeas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // Simple client-side search (Firebase doesn't support full-text search easily)
    const filtered = allIdeas.filter(idea => {
      const searchText = `${idea.title || ''} ${idea.description || ''} ${(idea.tags || []).join(' ')}`.toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    });
    
    return filtered;
  } catch (error) {
    console.error("Error searching ideas:", error);
    return [];
  }
}

// =============================
// 👤 USER PREFERENCES
// =============================

// Get user preferences
export async function fetchPreferences(userId = "default_user") {
  try {
    const ref = doc(db, "preferences", userId);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    } else {
      // Return default preferences
      const defaultPrefs = {
        id: userId,
        skillLevel: "Beginner",
        selectedThemes: [],
        interests: [],
        darkModeEnabled: false,
        projectDuration: "Short-term",
        teamSize: "Individual"
      };
      
      // Save default preferences
      await savePreferences(userId, defaultPrefs);
      return defaultPrefs;
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
    // Return default preferences as fallback
    return {
      id: userId,
      skillLevel: "Beginner",
      selectedThemes: [],
      interests: [],
      darkModeEnabled: false,
      projectDuration: "Short-term",
      teamSize: "Individual"
    };
  }
}

// Save user preferences
export async function savePreferences(userId = "default_user", preferences) {
  try {
    const ref = doc(db, "preferences", userId);
    const prefsWithTimestamp = {
      ...preferences,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(ref, prefsWithTimestamp).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, "preferences"), { 
        userId, 
        ...prefsWithTimestamp 
      });
    });
    
    return prefsWithTimestamp;
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
}

// =============================
// 📊 STATISTICS
// =============================

export async function fetchStats() {
  try {
    const [ideasSnap, componentsSnap] = await Promise.all([
      getDocs(collection(db, "ideas")),
      getDocs(collection(db, "components"))
    ]);
    
    const ideas = ideasSnap.docs.map(doc => doc.data());
    const favoriteIdeas = ideas.filter(idea => idea.isFavorite).length;
    
    return {
      ideasGenerated: ideasSnap.size,
      componentsAvailable: componentsSnap.size,
      projectsCompleted: 0, // This could be tracked separately
      favoriteIdeas: favoriteIdeas
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      ideasGenerated: 0,
      componentsAvailable: 8, // Default sample components count
      projectsCompleted: 0,
      favoriteIdeas: 0
    };
  }
}