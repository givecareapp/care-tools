# GiveCare Tools

> Open-source tools and frameworks for caregiving support and social determinants of health assessment

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

GiveCare Tools is an open-source repository providing frameworks, assessment tools, and utilities for organizations building caregiving support systems. Our flagship tool is the **GC-SDOH** (GiveCare Social Determinants of Health) assessment framework - a comprehensive, evidence-based screening tool designed to identify and address social factors impacting health outcomes in caregiving contexts.

These tools are used by [givecareapp.com](https://givecareapp.com) and are freely available for healthcare organizations, non-profits, researchers, and developers building solutions that address the whole-person needs of caregivers and care recipients.

## Why Open Source?

Social determinants of health affect millions of caregivers and care recipients. By making these tools open source, we aim to:

- Enable wider adoption of SDOH screening in caregiving contexts
- Foster collaboration among healthcare innovators
- Accelerate research and validation of assessment tools
- Reduce barriers for under-resourced organizations
- Build a community-driven approach to improving care outcomes

## Tools & Frameworks

### GC-SDOH-30 Assessment Framework

A comprehensive 30-question assessment tool evaluating six priority zones using a consistent 1-5 scale:

- **P1: Relationship & Social Support** (8 questions, 26.7%) - Social connections and caregiving support
- **P2: Physical Health** (2 questions, 6.7%) - Caregiver physical wellbeing and rest
- **P3: Housing & Environment** (4 questions, 13.3%) - Housing stability and safety
- **P4: Financial Resources** (8 questions, 26.7%) - Economic barriers and financial strain
- **P5: Legal & Navigation** (6 questions, 20.0%) - Healthcare navigation and legal preparedness
- **P6: Emotional Wellbeing** (2 questions, 6.7%) - Emergency preparedness and neighborhood safety

**Documentation:** See [GC-SDOH.md](./GC-SDOH.md) for complete assessment questions, scoring guidelines, and implementation details.

**Key Features:**
- Evidence-based questions adapted from validated SDOH screening tools
- 5-6 minute completion time
- Consistent 1-5 rating scale across all questions
- Zone-based risk scoring (Low/Moderate/High per zone)
- Zone-specific resource recommendations
- Caregiver-specific adaptations
- Multiple language support ready
- Privacy-first design

### Documentation

**Assessment Framework:**
- [Complete GC-SDOH-30 Documentation](./GC-SDOH.md) - Full assessment questions, scoring, and guidelines
- [Adaptive Assessment Pattern](./docs/ADAPTIVE-ASSESSMENT-PATTERN.md) - 3-tiered progressive assessment implementation guide

### Coming Soon

- Assessment implementation templates
- Scoring algorithms and SDKs
- Resource database schemas
- Integration examples
- Analytics and reporting tools
- Multi-language assessment versions

## Use Cases

- **Healthcare Organizations** - Integrate SDOH screening into care coordination
- **Non-Profit Organizations** - Identify client needs and connect to resources
- **Research Institutions** - Study social determinants in caregiving populations
- **Government Programs** - Screen for social needs in public benefit programs
- **Technology Platforms** - Build caregiving support applications
- **Community Health Centers** - Implement holistic care assessment

## Getting Started

### Using the Assessment Framework

1. Review the [GC-SDOH.md](./GC-SDOH.md) documentation
2. Adapt questions to your organizational context
3. Implement scoring and risk stratification
4. Connect to local resource databases
5. Track outcomes and validate results

### For Developers

```bash
# Clone the repository
git clone https://github.com/[your-org]/give-care-tools.git
cd give-care-tools

# More implementation details coming soon
```

### For Healthcare Organizations

The GC-SDOH framework can be implemented in:
- Electronic Health Records (EHR) systems
- Patient intake workflows
- Community health worker tools
- Care coordination platforms
- Telehealth applications

## Evidence Base

The GC-SDOH assessment draws from established, validated screening tools:

- **PRAPARE** - Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences
- **AHC Screening Tool** - Accountable Health Communities Health-Related Social Needs Screening
- **USDA Food Security Module** - U.S. Household Food Security Survey
- **NAM Framework** - National Academy of Medicine Social Determinants of Health recommendations
- **CMS Quality Measures** - Centers for Medicare & Medicaid Services social needs measures

## Contributing

GiveCare Tools warmly welcomes community contributions! We welcome contributions from:

- **Developers** - Code, SDKs, integrations, and tools
- **Healthcare Professionals** - Clinical validation and use case feedback
- **Researchers** - Validation studies and outcome research
- **Social Workers** - Resource mapping and intervention strategies
- **Caregivers** - User experience and assessment feedback

Please open an issue or PR if you encounter bugs or other pain points during your development, or start a discussion for more open-ended questions.

Please note that the core GC-SDOH framework is intended to be a relatively lightweight set of reusable components rather than an exhaustive catalog of assessment tools. Consider sharing any specialized assessments you create with the community.

For detailed guidelines, please read our [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code contributions
- Documentation improvements
- Issue reporting
- Feature requests
- Community standards

## Community & Support

- **Issues** - Report bugs or request features via GitHub Issues
- **Discussions** - Join conversations in GitHub Discussions
- **Documentation** - Assessment framework docs in [GC-SDOH.md](./GC-SDOH.md) and implementation guides in the [`/docs`](./docs) directory
- **Website** - Learn more at [givecareapp.com](https://givecareapp.com)

## Privacy & Security

Assessment tools dealing with health-related social needs require careful attention to privacy:

- Designed for HIPAA-compliant implementation
- No PHI stored in this repository
- Privacy-by-design principles
- Consent and disclosure guidelines included
- Security implementation guidance provided

Organizations implementing these tools are responsible for ensuring compliance with applicable privacy regulations.

## Roadmap

- [ ] Multi-language assessment versions (Spanish, Mandarin, Vietnamese)
- [ ] Scoring algorithm implementations (Python, JavaScript, R)
- [ ] Integration examples for popular EHR systems
- [ ] Resource database templates and schemas
- [ ] Analytics and outcome tracking tools
- [ ] Mobile-optimized assessment interface
- [ ] API specifications and reference implementations

## Citation

Originally created by Ali Madad (@amadad).

If you use the GC-SDOH-30 assessment in research or clinical practice, please cite:

```bibtex
@misc{madad_givecare_tools_2025,
  author       = {Ali Madad},
  title        = {{GiveCare Tools}: Open-source frameworks for caregiving support and social determinants of health assessment},
  note         = {GC-SDOH-30 v2.0 • Commit [hash] • accessed [date]},
  howpublished = {\url{https://github.com/[your-org]/give-care-tools}},
  year         = {2025}
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Attribution Required:** When using the GC-SDOH-30 assessment framework, please include:
- Credit to "GiveCare Tools" in user-facing materials
- Link to this repository in documentation
- Citation in research publications

## Acknowledgments

The GC-SDOH framework builds upon decades of research in social determinants of health and caregiving. We acknowledge:

- Healthcare organizations and researchers who developed the foundational SDOH screening tools
- Caregivers and care recipients who shared their experiences
- Community organizations addressing social needs on the ground
- Contributors to this open-source project

---

**Making caregiving more sustainable through open tools and collaborative innovation.**
