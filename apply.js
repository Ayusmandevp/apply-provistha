import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
        import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

        // --- FIREBASE CONFIG ---
        const firebaseConfig = {
            apiKey: "AIzaSyAQYTX7waM7XxHzWUetiayrQpRHoKTakDc",
            authDomain: "internship-data-collection.firebaseapp.com",
            projectId: "internship-data-collection",
            storageBucket: "internship-data-collection.firebasestorage.app",
            messagingSenderId: "527531758572",
            appId: "1:527531758572:web:12d85ee20d9c28c7f5a6c9"
        };
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // --- GLOBAL STATE & NAVIGATION ---
        window.appState = {
            currentRole: '',
            currentDocId: null
        };

        window.router = {
            navigate: function(viewId) {
                // Hide all views
                document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden-view'));
                
                // Show target view
                const target = document.getElementById('view-' + viewId);
                if(target) target.classList.remove('hidden-view');
                
                // Scroll to top
                window.scrollTo(0,0);

                // Specific Initializations
                if(viewId === 'eligibility') initEligibilityView();
                if(viewId === 'apply') initApplyView();
                if(viewId === 'verify') resetVerificationView();
            }
        };

        // --- HOME PAGE LOGIC ---
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Start Process -> Moves to Eligibility
        window.startProcess = function(roleName) {
            window.appState.currentRole = roleName;
            window.router.navigate('eligibility');
        }

        // Observer for Home Animations
        document.addEventListener('DOMContentLoaded', () => {
            const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('reveal-visible');
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            const cards = document.querySelectorAll('.intern-card');
            cards.forEach(card => observer.observe(card));
        });

        // --- ELIGIBILITY LOGIC ---
        const roleConfig = {
            'Digital Marketing & Content': {
                minYear: 1, allowedStreams: ['tech', 'management', 'design', 'other'],
                skills: ['Social Media Marketing', 'SEO (Search Engine Optimization)', 'Google Ads', 'Content Strategy', 'Google Analytics', 'Email Marketing', 'Copywriting'],
                minSkillsRequired: 1,
                questions: [ "Does the student have basic knowledge of SEO and SEM?", "Has the student ever managed social media campaigns?", "Does the student have experience in content writing?" ]
            },
            'UI/UX & Design': {
                minYear: 2, allowedStreams: ['tech', 'design', 'other'],
                skills: ['Figma', 'Adobe XD', 'Sketch', 'Wireframing', 'User Research', 'Prototyping', 'Usability Testing', 'Graphic Design (Branding)', 'Social Media Creatives'],
                minSkillsRequired: 2,
                questions: [ "Does the student know how to use tools like Figma/Adobe XD?", "Has the student ever created wireframes or prototypes?", "Does the student understand the design thinking process?" ]
            },
            'Backend Development': {
                minYear: 2, allowedStreams: ['tech'],
                skills: ['Node.js', 'Python', 'Django', 'PHP', 'SQL / Database Mgmt', 'API Development', 'Server Management', 'Git/GitHub'],
                minSkillsRequired: 2,
                questions: [ "Can the student code in Python/Java/Node.js?", "Has the student worked with databases like MySQL/MongoDB?", "Does the student understand API development and integration?" ]
            },
            'Content Creation': {
                minYear: 1, allowedStreams: ['tech', 'management', 'design', 'other'],
                skills: ['Creative Writing', 'Video Scripting', 'Research Skills', 'Storytelling', 'Proofreading', 'Blogging', 'Technical Writing'],
                minSkillsRequired: 1,
                questions: [ "Does the student have experience with video editing tools (Premiere Pro, Final Cut, etc.)?", "Has the student ever created content for YouTube/Instagram?", "Does the student have storytelling and creativity skills?" ]
            },
            'Marketing (BBA Focus)': {
                minYear: 1, allowedStreams: ['management', 'other'],
                skills: ['Market Research', 'Sales Strategy', 'Consumer Behavior', 'Lead Generation', 'Public Speaking', 'Business Communication', 'Brand Management'],
                minSkillsRequired: 1,
                questions: [ "Does the student know how to conduct market research?", "Does the student have experience in creating a sales pitch?", "Has the student ever participated in customer engagement campaigns?" ]
            }
        };

        function initEligibilityView() {
            const role = window.appState.currentRole;
            if(!role || !roleConfig[role]) { alert("No Role Selected"); window.router.navigate('home'); return; }
            
            document.getElementById('roleNameDisplay').innerText = role;
            
            // Render Skills
            const skillContainer = document.getElementById('skillsContainer');
            skillContainer.innerHTML = '';
            roleConfig[role].skills.forEach(skill => {
                skillContainer.innerHTML += `
                    <label class="cursor-pointer">
                        <input type="checkbox" name="skills" value="${skill}" class="skill-checkbox sr-only">
                        <div class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all select-none">${skill}</div>
                    </label>`;
            });

            // Render Questions
            const qContainer = document.getElementById('questionsContainer');
            qContainer.innerHTML = '';
            roleConfig[role].questions.forEach((q, i) => {
                qContainer.innerHTML += `
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p class="text-sm font-medium text-gray-800 mb-3">Q${i + 1}. ${q}</p>
                        <div class="flex gap-4">
                            <label class="cursor-pointer flex-1"><input type="radio" name="q${i}" value="yes" class="question-radio sr-only" required><div class="py-2 px-4 border rounded text-center text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"><i class="fas fa-check-circle check-icon hidden"></i> Yes</div></label>
                            <label class="cursor-pointer flex-1"><input type="radio" name="q${i}" value="no" class="question-radio sr-only" required><div class="py-2 px-4 border rounded text-center text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"><i class="fas fa-times-circle check-icon hidden"></i> No</div></label>
                        </div>
                    </div>`;
            });
            
            // Reset Modal
            document.getElementById('analysisModal').classList.add('hidden');
            document.getElementById('analysisModal').classList.remove('flex');
            document.getElementById('processingView').classList.remove('hidden');
            document.getElementById('successView').classList.add('hidden');
            document.getElementById('failView').classList.add('hidden');
        }

        window.runEligibilityCheck = function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userYear = parseInt(formData.get('year'));
            const userStream = formData.get('course');
            const userSkills = formData.getAll('skills');
            const role = window.appState.currentRole;
            const config = roleConfig[role];
            
            const answers = [];
            for(let i=0; i<config.questions.length; i++) answers.push(formData.get(`q${i}`));

            if(userSkills.length === 0) { document.getElementById('skillError').classList.remove('hidden'); return; }
            document.getElementById('skillError').classList.add('hidden');
            
            if(answers.includes(null)) { document.getElementById('questionError').classList.remove('hidden'); return; }
            document.getElementById('questionError').classList.add('hidden');

            const modal = document.getElementById('analysisModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            setTimeout(() => {
                let isEligible = true;
                let failureReason = "";

                if(userYear < config.minYear) { isEligible = false; failureReason = `Requires at least Year ${config.minYear}.`; }
                if(isEligible && !config.allowedStreams.includes(userStream)) { isEligible = false; failureReason = "Academic background mismatch."; }
                if(isEligible && userSkills.length < config.minSkillsRequired) { isEligible = false; failureReason = `Need at least ${config.minSkillsRequired} relevant skills.`; }
                if(isEligible && answers.filter(a => a === 'yes').length < 2) { isEligible = false; failureReason = "Assessment score too low."; }

                document.getElementById('processingView').classList.add('hidden');
                if(isEligible) document.getElementById('successView').classList.remove('hidden');
                else {
                    document.getElementById('failView').classList.remove('hidden');
                    document.getElementById('failReason').innerText = failureReason;
                }
            }, 2000);
        }

        window.proceedToForm = function() {
            window.router.navigate('apply');
        }

        // --- APPLY LOGIC ---
        function initApplyView() {
            const role = window.appState.currentRole;
            const domainSelect = document.getElementById('domainSelect');
            if(domainSelect) {
                domainSelect.value = role;
                domainSelect.classList.add('ring-2', 'ring-[#097241]');
            }
            document.getElementById('selectedRoleDisplay').innerText = role;
        }

        window.isPhoneVerified = false;
        let generatedOTP = null;
        let timerInterval = null;

        window.updateFileName = function(input, displayId) {
            const display = document.getElementById(displayId);
            if (input.files && input.files.length > 0) {
                const fileSize = (input.files[0].size / 1024).toFixed(2);
                if (fileSize > 300) { alert("File > 300KB!"); input.value = ""; display.innerText = ""; return; }
                display.innerText = `Selected: ${input.files[0].name} (${fileSize} KB)`;
                display.parentElement.parentElement.classList.add('border-[#097241]', 'bg-green-50');
            } else { display.innerText = ""; }
        }

        window.initiateOTPProcess = function() {
            const phoneInput = document.getElementById('phoneInput');
            if (!/^\d{10}$/.test(phoneInput.value)) { alert("Enter valid 10-digit number."); phoneInput.focus(); return; }
            
            const btn = document.getElementById('sendOtpBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true;
            
            generatedOTP = Math.floor(1000 + Math.random() * 9000);
            setTimeout(() => {
                alert(`ProVista Hub SMS:\nYour Verification OTP is: ${generatedOTP}`);
                document.getElementById('otpPanel').classList.remove('hidden');
                btn.classList.add('hidden');
                document.getElementById('otpInput').value = '';
                startResendTimer();
            }, 1500);
        }

        function startResendTimer() {
            let timeLeft = 30;
            const timerDisplay = document.getElementById('otpTimer');
            const resendBtn = document.getElementById('resendBtn');
            clearInterval(timerInterval);
            resendBtn.disabled = true;
            timerInterval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(timerInterval); timerDisplay.innerText = "Code Expired";
                    resendBtn.disabled = false; generatedOTP = null;
                } else { timerDisplay.innerText = `Resend in ${timeLeft}s`; timeLeft--; }
            }, 1000);
        }

        window.verifyGeneratedOTP = function() {
            const userEnteredOTP = document.getElementById('otpInput').value;
            if (!generatedOTP) { alert("OTP Expired!"); return; }
            if (parseInt(userEnteredOTP) === generatedOTP) {
                window.isPhoneVerified = true;
                clearInterval(timerInterval);
                document.getElementById('otpPanel').classList.add('hidden');
                document.getElementById('verifiedMsg').classList.remove('hidden');
                document.getElementById('verifiedIcon').classList.remove('hidden');
                document.getElementById('phoneInput').readOnly = true;
            } else { alert("Incorrect OTP!"); }
        }

        window.generateAppId = function() {
            return `PVH-INT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        }

        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        window.handleFormSubmit = async function(e) {
            e.preventDefault();
            if (!window.isPhoneVerified) { alert("Please verify Phone Number first."); return; }

            const btn = document.getElementById('submitBtn');
            const spinner = document.getElementById('loadingSpinner');
            
            btn.disabled = true;
            btn.querySelector('span').innerText = "Processing Files...";
            btn.querySelector('i').classList.add('hidden');
            spinner.classList.remove('hidden');

            try {
                const formData = new FormData(document.getElementById('internshipForm'));
                const newAppId = window.generateAppId();

                const resumeFile = formData.get('resume');
                const idCardFile = formData.get('idCard');
                let resumeBase64 = "No File", idCardBase64 = "No File";

                if (resumeFile && resumeFile.size > 0) resumeBase64 = await fileToBase64(resumeFile);
                if (idCardFile && idCardFile.size > 0) idCardBase64 = await fileToBase64(idCardFile);

                btn.querySelector('span').innerText = "Saving Application...";

                const studentData = {
                    appId: newAppId,
                    fullName: formData.get('fullName'),
                    dob: formData.get('dob'),
                    gender: formData.get('gender'),
                    contact: formData.get('contact'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                    college: formData.get('college'),
                    course: formData.get('course'),
                    year: formData.get('year'),
                    gradYear: formData.get('gradYear'),
                    enrollment: formData.get('enrollment'),
                    cgpa: formData.get('cgpa'),
                    techSkills: formData.get('techSkills'),
                    domain: formData.get('domain'),
                    mode: formData.get('mode'),
                    startDate: formData.get('startDate'),
                    portfolio: formData.get('portfolio'),
                    resumeFile: resumeBase64,
                    idCardFile: idCardBase64,
                    resumeName: resumeFile ? resumeFile.name : "",
                    submittedAt: serverTimestamp()
                };

                await addDoc(collection(db, "applications"), studentData);

                // EmailJS
                try {
                    btn.querySelector('span').innerText = "Sending Email...";
                    await emailjs.send("service_5d0gqpj", "template_oj32n7g", {
                        app_id: newAppId,
                        to_name: formData.get('fullName'),
                        to_email: formData.get('email'),
                        domain: formData.get('domain'),
                        college: formData.get('college')
                    });
                } catch(err) { console.error("Email failed", err); }

                document.getElementById('generatedAppId').innerText = newAppId;
                document.getElementById('successModal').classList.remove('hidden');
                document.getElementById('successModal').classList.add('flex');
                
                // Reset form
                document.getElementById('internshipForm').reset();
                window.isPhoneVerified = false;
                document.getElementById('verifiedMsg').classList.add('hidden');
                document.getElementById('phoneInput').readOnly = false;

            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                btn.disabled = false;
                btn.querySelector('span').innerText = "Submit Application";
                btn.querySelector('i').classList.remove('hidden');
                spinner.classList.add('hidden');
            }
        };

        // --- VERIFICATION LOGIC ---
        window.resetVerificationView = function() {
            document.getElementById('manualInputState').classList.remove('hidden');
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('errorState').classList.add('hidden');
            document.getElementById('dataState').classList.add('hidden');
            document.getElementById('manualAppId').value = '';
            window.appState.currentDocId = null;
        }

        window.fetchApplicationDetails = async function() {
            const appId = document.getElementById('manualAppId').value.trim();
            if(!appId) { alert("Please enter an App ID"); return; }

            document.getElementById('manualInputState').classList.add('hidden');
            document.getElementById('loadingState').classList.remove('hidden');

            try {
                const q = query(collection(db, "applications"), where("appId", "==", appId));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    document.getElementById('loadingState').classList.add('hidden');
                    document.getElementById('errorState').classList.remove('hidden');
                } else {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();
                    window.appState.currentDocId = docSnap.id;

                    document.getElementById('displayAppId').innerText = data.appId;
                    document.getElementById('studentName').innerText = data.fullName;
                    document.getElementById('studentEmail').innerText = data.email;
                    document.getElementById('studentDomain').innerText = data.domain;
                    if(data.submittedAt) {
                        const date = data.submittedAt.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt);
                        document.getElementById('studentDate').innerText = date.toLocaleDateString();
                    }

                    if(data.isVerifiedByStudent) showVerifiedState();
                    else {
                        document.getElementById('statusBadge').className = "status-badge status-pending";
                        document.getElementById('statusBadge').innerHTML = '<i class="fas fa-clock"></i> Verification Pending';
                        document.getElementById('verifyBtn').classList.remove('hidden');
                        document.getElementById('successMsg').classList.add('hidden');
                    }

                    document.getElementById('loadingState').classList.add('hidden');
                    document.getElementById('dataState').classList.remove('hidden');
                }
            } catch (error) {
                console.error(error);
                document.getElementById('loadingState').classList.add('hidden');
                document.getElementById('errorState').classList.remove('hidden');
            }
        }

        window.confirmVerification = async function() {
            if(!window.appState.currentDocId) return;
            const btn = document.getElementById('verifyBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;

            try {
                const docRef = doc(db, "applications", window.appState.currentDocId);
                await updateDoc(docRef, { isVerifiedByStudent: true, verifiedAt: new Date() });
                showVerifiedState();
            } catch (error) {
                alert("Failed: " + error.message);
                btn.innerHTML = 'Try Again'; btn.disabled = false;
            }
        }

        window.requestEdit = function() {
            alert("To make changes, please contact HR at hr@provistahub.com with your Application ID.\n\nSubmitting a new form will create a duplicate entry.");
        }

        function showVerifiedState() {
            const badge = document.getElementById('statusBadge');
            badge.className = "status-badge status-verified";
            badge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            document.getElementById('verifyBtn').classList.add('hidden');
            document.getElementById('successMsg').classList.remove('hidden');
        }