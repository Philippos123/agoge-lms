import { useEffect, useState } from "react";
import api from "../services/api";  // Din axios-instans
import { getFullMediaUrl } from "../services/api";



const user = JSON.parse(localStorage.getItem("user")); // Hämta inloggad användare
console.log("Inloggad användare:", user); // Debug
console.log("Är användaren admin?", user?.is_admin);



const handleInvite = async () => {
    const email = prompt("Ange e-post för den nya medlemmen:");
    if (!email) return;
  
    try {
      const response = await api.post("/team/invite/", { email });
      alert(response.data.message);
    } catch (err) {
      console.error("Error inviting member:", err);
      alert("Kunde inte skicka inbjudan.");
    }
  };
  
  const handleRemove = async (userId) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna användare?")) return;
  
    try {
      await api.delete(`/team/remove/${userId}/`);
      setTeam(team.filter((member) => member.id !== userId)); // Uppdatera UI
      alert("Användaren har tagits bort.");
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Kunde inte ta bort användaren.");
    }
  };
  

const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get("/team/");
        console.log("Team data:", response.data); // Se vad som kommer från API:et
        // Kontrollera specifikt profilbild-URL:er
        response.data.forEach(member => {
          console.log(`${member.first_name}'s profile image:`, member.profile_img_url);
        });
        setTeam(response.data);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError("Kunde inte hämta teamet.");
      }
    };
  
    fetchTeam();
  }, []);
  

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Mitt team</h2>
      {error && <p className="text-red-500">{error}</p>}
  
      
  <button onClick={handleInvite} className="bg-green-500 text-white px-4 py-2 rounded my-4">
    Bjud in medlem
  </button>
 
  
      <ul>
        {team.map((member) => (
          <div key={member.id} className="flex items-center space-x-4 p-2 border-b">
            <img
  src={getFullMediaUrl(member.profile_img_url) }
  alt={`${member.first_name} ${member.last_name}`}
  className="w-12 h-12 rounded-full object-cover"
/>
            <div>
              <span className="font-semibold">{member.first_name} {member.last_name}</span>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
  
            {/* Ta bort knapp (endast om admin) */}
            
  <button
    onClick={() => handleRemove(member.id)}
    className="bg-red-500 text-white px-3 py-1 rounded"
  >
    Ta bort
  </button>
  

          </div>
        ))}
      </ul>
    </div>
  );
  
};

export default TeamPage;
