const { User, Expert } = require('./src/models');
const logger = require('./src/middleware/logger');

const fixVetProfiles = async () => {
    try {
        const vetUsers = await User.findAll({ where: { isVeterinarian: true } });
        console.log(`Found ${vetUsers.length} veterinarian users.`);

        for (const user of vetUsers) {
            const existingExpert = await Expert.findOne({ where: { userId: user.id } });
            if (existingExpert) {
                console.log(`User ${user.email} (ID: ${user.id}) already has an expert profile (ID: ${existingExpert.id}).`);
                continue;
            }

            // check if there's an expert with the same name but no userId
            const nameExpert = await Expert.findOne({ 
                where: { 
                    name: `${user.firstName} ${user.lastName}`,
                    userId: null 
                } 
            });

            if (nameExpert) {
                await nameExpert.update({ userId: user.id });
                console.log(`Linked existing expert ${nameExpert.name} (ID: ${nameExpert.id}) to user ${user.email} (ID: ${user.id}).`);
            } else {
                // Create a generic expert profile
                const newExpert = await Expert.create({
                    name: `${user.firstName} ${user.lastName}`,
                    designation: user.currentPosition || 'Veterinary Specialist',
                    specialization: 'General Veterinary',
                    yearsOfExperience: 5,
                    userId: user.id,
                    isActive: true,
                    email: user.email,
                    phone: user.mobile,
                    consultationFee: 500.00
                });
                console.log(`Created new expert profile for user ${user.email} (ID: ${user.id}, Expert ID: ${newExpert.id}).`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Error fixing vet profiles:', error);
        process.exit(1);
    }
};

fixVetProfiles();
